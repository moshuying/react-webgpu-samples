export const randomColor = () => {
    return [
        Math.floor(Math.random() * 1000) / 1000,
        Math.floor(Math.random() * 1000) / 1000,
        Math.floor(Math.random() * 1000) / 1000
    ]
}

export const getRandomColor = (total: number = 1): Float32Array => {
    const colors: number[] = []
    for (let i = 0; i < total; i++) {
        colors.push(...randomColor())
    }
    return new Float32Array(colors)
}