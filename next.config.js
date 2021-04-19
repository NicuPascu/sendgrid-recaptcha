const withSass = require('@zeit/next-sass');

module.exports = withSass({
    poweredByHeader: false,
    webpack(config, options) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });

        return config;
    },
});
