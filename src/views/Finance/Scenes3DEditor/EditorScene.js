import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, Grid } from '@react-three/drei'
import * as THREE from 'three'

// ── Geometry per type ─────────────────────────────────────────────────────────

const buildGeometry = (type) => {
  switch (type) {
    case 'box':      return <boxGeometry args={[1, 1, 1]} />
    case 'sphere':   return <sphereGeometry args={[0.5, 32, 32]} />
    case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
    case 'cone':     return <coneGeometry args={[0.5, 1, 32]} />
    case 'torus':    return <torusGeometry args={[0.5, 0.2, 16, 64]} />
    case 'plane':    return <planeGeometry args={[1, 1]} />
    default:         return <boxGeometry args={[1, 1, 1]} />
  }
}

// ── Single 3D object ──────────────────────────────────────────────────────────

const SceneObject = ({ obj, isSelected, onSelect }) => {
  const meshRef = useRef()

  const handleClick = (e) => {
    e.stopPropagation()
    if (!obj.locked) onSelect(obj.id, meshRef)
  }

  if (!obj.visible) return null

  return (
    <mesh
      ref={meshRef}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      onClick={handleClick}
    >
      {buildGeometry(obj.type)}
      <meshStandardMaterial
        color={obj.color}
        opacity={obj.opacity ?? 1}
        transparent={obj.opacity < 1}
        wireframe={obj.wireframe ?? false}
        emissive={isSelected ? new THREE.Color(obj.color) : new THREE.Color(0x000000)}
        emissiveIntensity={isSelected ? 0.15 : 0}
      />
    </mesh>
  )
}

// ── Canvas exporter (inside Canvas, access to gl/scene/camera) ────────────────

const CanvasExporter = forwardRef((_, ref) => {
  const { gl, scene, camera } = useThree()
  useImperativeHandle(ref, () => ({
    exportPNG: (filename) => {
      gl.render(scene, camera)
      const url = gl.domElement.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.png`
      a.click()
    },
  }))
  return null
})

// ── Scene content (inside Canvas) ────────────────────────────────────────────

const SceneContent = ({
  sceneConfig, objects, selectedId, selectedMeshRef,
  transformMode, orbitRef, onSelect, onTransformEnd, exporterRef,
}) => {
  const transformRef = useRef()

  useEffect(() => {
    const tc = transformRef.current
    const orbit = orbitRef.current
    if (!tc || !orbit) return
    const handler = (e) => { orbit.enabled = !e.value }
    tc.addEventListener('dragging-changed', handler)
    return () => tc.removeEventListener('dragging-changed', handler)
  }, [selectedId, orbitRef])

  const handleTransformMouseUp = () => {
    const mesh = selectedMeshRef?.current
    if (!mesh) return
    onTransformEnd(selectedId, {
      position: mesh.position.toArray(),
      rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
      scale: mesh.scale.toArray(),
    })
  }

  return (
    <>
      <CanvasExporter ref={exporterRef} />

      {/* Lighting */}
      <ambientLight intensity={sceneConfig.ambientIntensity ?? 0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={sceneConfig.dirLightIntensity ?? 1.2}
        color={sceneConfig.dirLightColor ?? '#ffffff'}
        castShadow
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Grid */}
      {sceneConfig.grid && (
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#444466"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#6666aa"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      {/* Objects */}
      {objects.map((obj) => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={selectedId === obj.id}
          onSelect={onSelect}
        />
      ))}

      {/* TransformControls for selected object */}
      {selectedMeshRef?.current && (
        <TransformControls
          ref={transformRef}
          object={selectedMeshRef.current}
          mode={transformMode}
          onMouseUp={handleTransformMouseUp}
        />
      )}

      {/* OrbitControls */}
      <OrbitControls ref={orbitRef} makeDefault />
    </>
  )
}

// ── EditorScene (exported, forwardRef for export) ─────────────────────────────

const EditorScene = forwardRef(({
  sceneConfig, objects, selectedId, selectedMeshRef,
  transformMode, onSelect, onDeselect, onTransformEnd,
}, ref) => {
  const orbitRef = useRef()
  const exporterRef = useRef()

  useImperativeHandle(ref, () => ({
    exportPNG: (filename) => exporterRef.current?.exportPNG(filename),
  }))

  return (
    <Canvas
      className="s3d-canvas"
      camera={{ position: [4, 4, 6], fov: 55, near: 0.1, far: 200 }}
      shadows
      gl={{ preserveDrawingBuffer: true }}
      onPointerMissed={onDeselect}
    >
      <color attach="background" args={[sceneConfig.bg ?? '#1a1a2e']} />

      <SceneContent
        sceneConfig={sceneConfig}
        objects={objects}
        selectedId={selectedId}
        selectedMeshRef={selectedMeshRef}
        transformMode={transformMode}
        orbitRef={orbitRef}
        onSelect={onSelect}
        onTransformEnd={onTransformEnd}
        exporterRef={exporterRef}
      />
    </Canvas>
  )
})

export default EditorScene
