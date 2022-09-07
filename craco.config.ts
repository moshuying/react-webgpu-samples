import path from 'path'
module.exports = {
    webpack: {
        alias: {
            "@/components": path.resolve(__dirname, "src/components/"),
            "@/hooks": path.resolve(__dirname, "src/hooks/"),
            "@/shaders": path.resolve(__dirname, "src/shaders/"),
            "@/geometrys": path.resolve(__dirname, "src/geometrys/"),
            "@/utils": path.resolve(__dirname, "src/utils/")
        },
        configure: {
            module: {
                rules: [
                    { test: /\.wgsl$/, type: "asset/source" }
                ],
            }
        }
    }
}