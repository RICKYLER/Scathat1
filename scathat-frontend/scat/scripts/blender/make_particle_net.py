import bpy
import random

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

nodes = []
for i in range(80):
    x = random.uniform(-4,4)
    y = random.uniform(-2,2)
    z = random.uniform(-1,1)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.03, location=(x,y,z))
    s = bpy.context.object
    nodes.append(s)
    mat = bpy.data.materials.new(name=f'pt_mat_{i}')
    mat.use_nodes = True
    n = mat.node_tree.nodes
    n.clear()
    em = n.new(type='ShaderNodeEmission')
    em.inputs['Color'].default_value = (0.1, 0.9, 0.8, 1)
    em.inputs['Strength'].default_value = 3.5
    out = n.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(em.outputs[0], out.inputs[0])
    s.data.materials.append(mat)

bpy.ops.object.select_all(action='DESELECT')
for s in nodes:
    s.select_set(True)
bpy.context.view_layer.objects.active = nodes[0]
bpy.ops.object.join()
joined = bpy.context.object
joined.name = 'ParticleNet'

bpy.ops.export_scene.gltf(filepath=bpy.path.abspath('//particle_net.glb'), export_extras=True, export_apply=True)
print('Exported particle_net.glb')
