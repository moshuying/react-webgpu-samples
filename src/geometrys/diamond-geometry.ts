import { vec3 } from "gl-matrix";
import BufferGeometry from "./buffer-geometry";

class DiamondGeometry extends BufferGeometry {

    private _width: number
    private _height: number
    private _facets: number

    constructor(width: number = 1, height: number = 1, facets: number = 3) {
        super()
        this._type = 'DiamondGeometry'

        this._width = width
        this._height = height
        this._facets = Math.max(Math.floor(facets), 3)

        this.updateVertices()
    }

    protected updateVertices() {
        const radian = 2 * Math.PI / this._facets
        const halfWidth = this._width / 2
        const halfHeight = this._height / 2

        const topPoint = vec3.fromValues(0.0, halfHeight, 0.0)
        const bottomPoint = vec3.fromValues(0.0, -halfHeight, 0.0)
        const midPoints: vec3[] = []
        for (let i = 0; i < this._facets; i++) {
            midPoints.push(
                vec3.fromValues(
                    Math.cos(i * radian) * halfWidth,
                    0.0,
                    -Math.sin(i * radian) * halfWidth
                )
            )
        }

        const triangle: vec3[] = []
        for (let i = 0; i < midPoints.length - 2; i++) {
            triangle.push(topPoint, midPoints[i], midPoints[i + 1])
            triangle.push(bottomPoint, midPoints[i], midPoints[i + 1])
        }
        triangle.push(topPoint, midPoints[midPoints.length - 1], midPoints[0])
        triangle.push(bottomPoint, midPoints[midPoints.length - 1], midPoints[0])

        const newVertices: number[] = []
        triangle.forEach(point => {
            newVertices.push(...point)
        })

        this._vertices = new Float32Array(newVertices)
    }

    public set width(value: number) {
        this._width = value
    }

    public get width(): number {
        return this._width
    }

    public set height(value: number) {
        this._height = value
    }

    public get height(): number {
        return this._height
    }

    public set facets(value: number) {
        this._facets = value
    }

    public get facets(): number {
        return this._facets
    }
}

export default DiamondGeometry