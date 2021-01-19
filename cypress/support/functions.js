export const getUrl = () => {
    if(!process.env.TEST_ENV) {
        return "https://www.test.bbc.co.uk/games/embed/genie?versionOverride=latest&viewNonPublished=true&cageEnv=test&debug=true";
    } else {
        return "http://localhost:9000/?debug=true"
    }
};