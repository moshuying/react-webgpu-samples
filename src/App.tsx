import { Fragment } from 'react'
import './App.scss'

//import SimpleTriangle from '@/components/simple-triangle'
//import VertexBuffrSlot from './components/vertex-buffer-slot'
import XYZVertexBufferSlot from './components/xy-z-vertex-buffer-slot'

function App() {
    return (
        <Fragment>
            {/*
            <SimpleTriangle />
            <VertexBuffrSlot />
             */}

             <XYZVertexBufferSlot />
        </Fragment>
    )
}

export default App