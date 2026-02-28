import fs from 'fs';
import path from 'path';
import { NavBar, type Route } from './NavBar';
import { client } from '@/sanity/client';

const APP_DIR = path.join(process.cwd(), 'src/app');

// Maps each page route path to its Sanity document _id (or a special key)
const PATH_SANITY_MAP: Record<string, string> = {
    '/agenda': 'agendaPage',
    '/gospelation': 'gospelationPage',
    '/gospelation/engagieren': 'gospelationEngagierenPage',
    '/gospelproject': 'gospelprojectPage',
    '/gospelproject/mitmachen': 'gospelprojectMitmachenPage',
    '/gospelproject/anmeldung': 'gospelprojectAnmeldungPage',
    '/gospelproject/termine': 'gospelprojectTerminePage',
    '/gospelproject/team': 'teamPage',
    '/gospelproject/member': 'gospelprojectMemberPage',
    '/impressionen': '__gallery__',
    '/kontakt': 'kontaktPage',
    '/sponsoring': 'sponsoringPage',
    '/gospelproject/teilnahmebedingungen': 'gospelprojectBedingungenPage',
};

const SINGLETON_IDS = Object.values(PATH_SANITY_MAP).filter(id => id !== '__gallery__');

const VISIBILITY_QUERY = `{
  "singletons": *[_id in $ids] { _id, visible },
  "gallery": *[_type == "gallery"][0] { visible },
  "navigationOrder": *[_type == "navigationSettings"][0].mainNav[]{
    "id": page->_id,
    "title": title,
    "children": children[]{
      "id": page->_id,
      "title": title
    }
  }
}`;

// Pages linked from the footer — excluded from the main nav
const NAV_EXCLUDED_PATHS = new Set([
    '/impressum',
    '/datenschutz',
    '/newsletter',
])

function getRoutes(dir: string, baseUrl: string = ''): Route[] {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const routes: Route[] = [];

    for (const item of items) {
        if (item.name.startsWith('_') || item.name.startsWith('(') || item.name.startsWith('.') || item.name.startsWith('[')) {
            continue;
        }

        if (item.isDirectory()) {
            const pagePath = path.join(dir, item.name, 'page.tsx')
            if (fs.existsSync(pagePath)) {
                const currentPath = `${baseUrl}/${item.name}`

                if (NAV_EXCLUDED_PATHS.has(currentPath)) continue
                const children = getRoutes(path.join(dir, item.name), currentPath);

                const title = item.name
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                routes.push({
                    title,
                    path: currentPath,
                    children: children.length > 0 ? children : undefined
                });
            } else {
                const currentPath = `${baseUrl}/${item.name}`;
                const validChildren = getRoutes(path.join(dir, item.name), currentPath);
                if (validChildren.length > 0) {
                    // folder without page — skip for now
                }
            }
        }
    }

    return routes;
}

function filterByVisibility(routes: Route[], visibilityMap: Record<string, boolean | null>): Route[] {
    return routes
        .filter(route => {
            const key = PATH_SANITY_MAP[route.path];
            if (!key) return true; // no Sanity mapping → always visible
            const val = visibilityMap[key];
            return val !== false; // null / undefined / true → visible
        })
        .map(route => ({
            ...route,
            children: route.children
                ? filterByVisibility(route.children, visibilityMap)
                : undefined,
        }));
}

export async function Navigation() {
    const [visibilityData, rawRoutes] = await Promise.all([
        client.fetch<{
            singletons: Array<{ _id: string; visible: boolean | null }>;
            gallery: { visible: boolean | null } | null;
            navigationOrder: Array<{ id: string; title: string | null; children: Array<{ id: string; title: string | null }> | null }> | null;
        }>(VISIBILITY_QUERY, { ids: SINGLETON_IDS }),
        Promise.resolve([
            ...getRoutes(APP_DIR),
        ] as Route[]),
    ]);

    const visibilityMap: Record<string, boolean | null> = {};
    visibilityData.singletons.forEach(doc => {
        visibilityMap[doc._id] = doc.visible;
    });
    visibilityMap['__gallery__'] = visibilityData.gallery?.visible ?? null;

    const orderMap: Record<string, number> = {};
    const customTitleMap: Record<string, string> = {};

    visibilityData.navigationOrder?.forEach((item, index) => {
        if (item.id) {
            orderMap[item.id] = index;
            if (item.title) customTitleMap[item.id] = item.title;
        }
        item.children?.forEach((child, childIndex) => {
            if (child.id) {
                orderMap[child.id] = childIndex;
                if (child.title) customTitleMap[child.id] = child.title;
            }
        });
    });

    function processRoutes(routesToProcess: Route[]): Route[] {
        return routesToProcess.map(route => {
            const id = PATH_SANITY_MAP[route.path];
            let title = route.title;
            if (id && customTitleMap[id]) {
                title = customTitleMap[id];
            }
            return {
                ...route,
                title,
                children: route.children ? processRoutes(route.children) : undefined
            };
        }).sort((a, b) => {
            const idA = PATH_SANITY_MAP[a.path];
            const idB = PATH_SANITY_MAP[b.path];

            const orderA = idA && orderMap[idA] !== undefined ? orderMap[idA] : 999;
            const orderB = idB && orderMap[idB] !== undefined ? orderMap[idB] : 999;

            return orderA - orderB;
        });
    }

    const routes = processRoutes(filterByVisibility(rawRoutes, visibilityMap));

    return <NavBar routes={routes} />;
}
