const { createClient } = require("next-sanity");
const client = createClient({
    projectId: "jynb9blr",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
});
async function run() {
    const byId = await client.fetch('*[_id == "homePage"][0]');
    const byType = await client.fetch('*[_type == "homePage"][0]');
    console.log("byId id:", byId?._id);
    console.log("byType id:", byType?._id);
}
run();
