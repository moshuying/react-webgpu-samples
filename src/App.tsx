import { Fragment } from 'react'
import './App.scss'

//import SimpleTriangle from '@/components/simple-triangle'
//import VertexBuffrSlot from './components/vertex-buffer-slot'
//import XYZVertexBufferSlot from './components/xy-z-vertex-buffer-slot'
//import FragBindGroup from './components/frag-bind-group'
import HeartShape from './components/heart-shape'

function App() {
    return (
        <Fragment>
            {/*
            <SimpleTriangle />
            <VertexBuffrSlot />
            <XYZVertexBufferSlot />
            <FragBindGroup />
             */}

             <HeartShape />
        </Fragment>
    )
}

export default App