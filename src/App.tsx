import { Fragment } from 'react'
import './App.scss'

//import SimpleTriangle from '@/components/simple-triangle'
//import VertexBuffrSlot from './components/vertex-buffer-slot'
//import XYZVertexBufferSlot from './components/xy-z-vertex-buffer-slot'
//import FragBindGroup from './components/frag-bind-group'
//import HeartShape from './components/heart-shape'
//import NDCTriangle from './components/ndc-triangle'
//import ColorInterpolation from './components/color-interpolation'
import SimpleDiamond from './components/simple-diamond'

function App() {
    return (
        <Fragment>
            {/*
            <SimpleTriangle />
            <VertexBuffrSlot />
            <XYZVertexBufferSlot />
            <FragBindGroup />
            <HeartShape />
            <NDCTriangle />
            <ColorInterpolation />
             */}
            <SimpleDiamond />
        </Fragment>
    )
}

export default App