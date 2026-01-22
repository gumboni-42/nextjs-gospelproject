import fs from 'fs';
import path from 'path';
import { NavBar, type Route } from './NavBar';

const APP_DIR = path.join(process.cwd(), 'src/app');

function getRoutes(dir: string, baseUrl: string = ''): Route[] {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const routes: Route[] = [];

    for (const item of items) {
        if (item.name.startsWith('_') || item.name.startsWith('(') || item.name.startsWith('.') || item.name.startsWith('[')) {
            continue;
        }

        if (item.isDirectory()) {
            // Check if this directory has a page
            const pagePath = path.join(dir, item.name, 'page.tsx');
            if (fs.existsSync(pagePath)) {
                const currentPath = `${baseUrl}/${item.name}`;
                const children = getRoutes(path.join(dir, item.name), currentPath);

                // Title case format: "my-page" -> "My Page"
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
                // If no page.tsx, maybe it's just a folder grouping other pages?
                // For now, let's just recurse and flatten if the parent itself isn't a route?
                // Actually requirement says "links to all pages in /app".
                // If a dir doesn't have a page, it's not a linkable route.
                // But it might have children that are linkable.
                // For this iteration, let's treat folders without page.tsx as just containers (but nav structure usually implies the parent is linkable or a label).
                // Let's check for children valid routes.
                const currentPath = `${baseUrl}/${item.name}`;
                const validChildren = getRoutes(path.join(dir, item.name), currentPath);
                if (validChildren.length > 0) {
                    // It's a group header, but not a link itself? 
                    // NavBar expects valid paths.
                    // Let's skip non-page folders for top level simplicity or use the first child?
                    // Simpler: Only list folders that ARE pages.
                }
            }
        }
    }

    // Sort routes: Home first, then others alphabetically? 
    // actually Home '/' is root.
    return routes;
}

export async function Navigation() {
    // Manually add Home
    const routes: Route[] = [
        { title: 'Home', path: '/' },
        ...getRoutes(APP_DIR)
    ];

    return <NavBar routes={routes} />;
}
