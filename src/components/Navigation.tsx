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
  "gallery": *[_type == "gallery"][0] { visible }
}`;

function getRoutes(dir: string, baseUrl: string = ''): Route[] {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const routes: Route[] = [];

    for (const item of items) {
        if (item.name.startsWith('_') || item.name.startsWith('(') || item.name.startsWith('.') || item.name.startsWith('[')) {
            continue;
        }

        if (item.isDirectory()) {
            const pagePath = path.join(dir, item.name, 'page.tsx');
            if (fs.existsSync(pagePath)) {
                const currentPath = `${baseUrl}/${item.name}`;
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
        }>(VISIBILITY_QUERY, { ids: SINGLETON_IDS }),
        Promise.resolve([
            { title: 'Home', path: '/' },
            ...getRoutes(APP_DIR),
        ] as Route[]),
    ]);

    const visibilityMap: Record<string, boolean | null> = {};
    visibilityData.singletons.forEach(doc => {
        visibilityMap[doc._id] = doc.visible;
    });
    visibilityMap['__gallery__'] = visibilityData.gallery?.visible ?? null;

    const routes = filterByVisibility(rawRoutes, visibilityMap);

    return <NavBar routes={routes} />;
}
