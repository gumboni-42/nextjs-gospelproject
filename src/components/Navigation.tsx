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
};

const SINGLETON_IDS = Object.values(PATH_SANITY_MAP).filter(id => id !== '__gallery__');

const VISIBILITY_QUERY = `{
  "singletons": *[_id in $ids] { _id, visible },
  "gallery": *[_type == "gallery"][0] { visible },
  "navigationOrder": *[_type == "navigationSettings"][0].mainNav[]{
    "id": page->_id,
    "title": title
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
            navigationOrder: Array<{ id: string; title: string | null }> | null;
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

    const orderMap = visibilityData.navigationOrder?.reduce((acc, item, index) => {
        if (item.id) acc[item.id] = index;
        return acc;
    }, {} as Record<string, number>) || {};

    const customTitleMap = visibilityData.navigationOrder?.reduce((acc, item) => {
        if (item.id && item.title) acc[item.id] = item.title;
        return acc;
    }, {} as Record<string, string>) || {};

    const routes = filterByVisibility(rawRoutes, visibilityMap).map(route => {
        const id = PATH_SANITY_MAP[route.path];
        if (id && customTitleMap[id]) {
            return { ...route, title: customTitleMap[id] };
        }
        return route;
    }).sort((a, b) => {
        const idA = PATH_SANITY_MAP[a.path];
        const idB = PATH_SANITY_MAP[b.path];

        const orderA = idA && orderMap[idA] !== undefined ? orderMap[idA] : 999;
        const orderB = idB && orderMap[idB] !== undefined ? orderMap[idB] : 999;

        return orderA - orderB;
    });

    return <NavBar routes={routes} />;
}
