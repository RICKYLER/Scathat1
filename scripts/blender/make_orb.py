import bpy
import math

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=1, location=(0,0,0))
orb = bpy.context.object
orb.name = 'Orb'

wf = orb.modifiers.new(name='Wireframe', type='WIREFRAME')
wf.thickness = 0.02

mat = bpy.data.materials.new(name='Orb_Emission')
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
nodes.clear()
node_em = nodes.new(type='ShaderNodeEmission')
node_em.inputs['Color'].default_value = (0.03, 0.9, 0.2, 1)
node_em.inputs['Strength'].default_value = 8.0
node_out = nodes.new(type='ShaderNodeOutputMaterial')
links.new(node_em.outputs[0], node_out.inputs[0])
orb.data.materials.append(mat)

for i in range(6):
    ang = i * (2*math.pi/6)
    x = 2.0 * math.cos(ang)
    y = 2.0 * math.sin(ang)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=(x,y,0.2*i*0.02))
    s = bpy.context.object
    s_mat = bpy.data.materials.new(name=f'particle_mat_{i}')
    s_mat.use_nodes = True
    nodes = s_mat.node_tree.nodes
    nodes.clear()
    nem = nodes.new(type='ShaderNodeEmission')
    nem.inputs['Color'].default_value = (0.2, 1.0, 0.4, 1)
    nem.inputs['Strength'].default_value = 6.0
    nout = nodes.new(type='ShaderNodeOutputMaterial')
    s_mat.node_tree.links.new(nem.outputs[0], nout.inputs[0])
    s.data.materials.append(s_mat)

orb.rotation_euler = (0,0,0)
orb.keyframe_insert(data_path='rotation_euler', frame=1)
orb.rotation_euler = (0, 0, 6.28318)
orb.keyframe_insert(data_path='rotation_euler', frame=250)

for fcurve in orb.animation_data.action.fcurves:
    for k in fcurve.keyframe_points:
        k.interpolation = 'LINEAR'

bpy.ops.export_scene.gltf(filepath=bpy.path.abspath('//orb.glb'), export_extras=True, export_apply=True)
print('Exported orb.glb')
