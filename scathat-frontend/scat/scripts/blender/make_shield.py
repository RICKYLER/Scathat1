import bpy

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

bpy.ops.mesh.primitive_circle_add(vertices=8, radius=1.5, fill_type='NGON', location=(0,0,0))
shield = bpy.context.object
shield.name = 'ShieldBase'

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.transform.resize(value=(1.0, 0.9, 1.0))
bpy.ops.mesh.subdivide(number_cuts=6)
bpy.ops.object.mode_set(mode='OBJECT')

solid = shield.modifiers.new(name='Solidify', type='SOLIDIFY')
solid.thickness = 0.15

bevel = shield.modifiers.new(name='Bevel', type='BEVEL')
bevel.width = 0.05
bevel.segments = 4

mat = bpy.data.materials.new(name='Shield_Mat')
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
nodes.clear()
node_pr = nodes.new(type='ShaderNodeBsdfPrincipled')
node_pr.inputs['Base Color'].default_value = (0.02, 0.02, 0.02, 1)
node_pr.inputs['Metallic'].default_value = 0.8
node_pr.inputs['Roughness'].default_value = 0.25
node_out = nodes.new(type='ShaderNodeOutputMaterial')
links.new(node_pr.outputs[0], node_out.inputs[0])
shield.data.materials.append(mat)

bpy.ops.curve.primitive_nurbs_path_add(location=(0,0,0.02))
curve = bpy.context.object
curve.data.bevel_depth = 0.01

emat = bpy.data.materials.new(name='Circuit_Emission')
emat.use_nodes = True
enodes = emat.node_tree.nodes
elinks = emat.node_tree.links
enodes.clear()
nen = enodes.new(type='ShaderNodeEmission')
nen.inputs['Color'].default_value = (0.0, 0.9, 0.2, 1)
nen.inputs['Strength'].default_value = 12.0
nout = enodes.new(type='ShaderNodeOutputMaterial')
elinks.new(nen.outputs[0], nout.inputs[0])
curve.data.materials.append(emat)

curve.parent = shield

shield.rotation_euler = (0,0,0)
shield.keyframe_insert(data_path='rotation_euler', frame=1)
shield.rotation_euler = (0,0,6.28318)
shield.keyframe_insert(data_path='rotation_euler', frame=300)
for fcurve in shield.animation_data.action.fcurves:
    for k in fcurve.keyframe_points:
        k.interpolation = 'LINEAR'

bpy.ops.export_scene.gltf(filepath=bpy.path.abspath('//shield.glb'), export_extras=True, export_apply=True)
print('Exported shield.glb')
