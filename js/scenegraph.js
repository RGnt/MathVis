// export class TRS {
//     constructor() {
//         this.translation = [0, 0, 0];
//         this.rotation = [0, 0, 0];
//         this.scale = [1, 1, 1];
//     }

//     getMatrix(dst) {
//         dst = dst || new Float32Array(16);
//         var t = this.translation;
//         var r = this.rotation;
//         var s = this.scale;
//         // compute a matrix from translation, rotation, and scale
//         m4.translation(t[0], t[1], t[2], dst);
//         m4.xRotate(dst, r[0], dst);
//         m4.yRotate(dst, r[1], dst);
//         m4.zRotate(dst, r[2], dst);
//         m4.scale(dst, s[0], s[1], s[2], dst);
//         return dst;
//     }
// }

// export class Node {
//     constructor(source) {
//         this.children = [];
//         this.localMatrix = m4.identity();
//         this.worldMatrix = m4.identity();
//         this.source = source;
//     }

//     setParent(parent) {
//         // remove us from our parent
//         if (this.parent) {
//             var ndx = this.parent.children.indexOf(this);
//             if (ndx >= 0) {
//                 this.parent.children.splice(ndx, 1);
//             }
//         }

//         // Add us to our new parent
//         if (parent) {
//             parent.children.push(this);
//         }
//         this.parent = parent;
//     }

//     updateWorldMatrix(matrix) {
//         var source = this.source;
//         if (source) {
//             source.getMatrix(this.localMatrix);
//         }

//         if (matrix) {
//             // a matrix was passed in so do the math
//             m4.multiply(matrix, this.localMatrix, this.worldMatrix);
//         } else {
//             // no matrix was passed in so just copy.
//             m4.copy(this.localMatrix, this.worldMatrix);
//         }

//         // now process all the children
//         var worldMatrix = this.worldMatrix;
//         this.children.forEach(function (child) {
//             child.updateWorldMatrix(worldMatrix);
//         });
//     }
// }

// function main() {
//     // Let's make all the nodes
//     var blockGuyNodeDescriptions = {
//         name: "main matrix",
//         draw: true,
//         children: [
//             {
//                 name: "waist",
//                 translation: [0, 3, 0],
//                 children: [
//                     {
//                         name: "torso",
//                         translation: [0, 2, 0],
//                         children: [
//                             {
//                                 name: "neck",
//                                 translation: [0, 1, 0],
//                                 children: [
//                                     {
//                                         name: "head",
//                                         translation: [0, 1, 0],
//                                     },
//                                 ],
//                             },
//                             {
//                                 name: "left-arm",
//                                 translation: [-1, 0, 0],
//                                 children: [
//                                     {
//                                         name: "left-forearm",
//                                         translation: [-1, 0, 0],
//                                         children: [
//                                             {
//                                                 name: "left-hand",
//                                                 translation: [-1, 0, 0],
//                                             },
//                                         ],
//                                     },
//                                 ],
//                             },
//                             {
//                                 name: "right-arm",
//                                 translation: [1, 0, 0],
//                                 children: [
//                                     {
//                                         name: "right-forearm",
//                                         translation: [1, 0, 0],
//                                         children: [
//                                             {
//                                                 name: "right-hand",
//                                                 translation: [1, 0, 0],
//                                             },
//                                         ],
//                                     },
//                                 ],
//                             },
//                         ],
//                     },
//                     {
//                         name: "left-leg",
//                         translation: [-1, -1, 0],
//                         children: [
//                             {
//                                 name: "left-calf",
//                                 translation: [0, -1, 0],
//                                 children: [
//                                     {
//                                         name: "left-foot",
//                                         translation: [0, -1, 0],
//                                     },
//                                 ],
//                             },
//                         ],
//                     },
//                     {
//                         name: "right-leg",
//                         translation: [1, -1, 0],
//                         children: [
//                             {
//                                 name: "right-calf",
//                                 translation: [0, -1, 0],
//                                 children: [
//                                     {
//                                         name: "right-foot",
//                                         translation: [0, -1, 0],
//                                     },
//                                 ],
//                             },
//                         ],
//                     },
//                 ],
//             },
//         ],
//     };

//     function makeNode(nodeDescription) {
//         var trs = new TRS();
//         var node = new Node(trs);
//         nodeInfosByName[nodeDescription.name] = {
//             trs: trs,
//             node: node,
//         };
//         trs.translation = nodeDescription.translation || trs.translation;
//         if (nodeDescription.draw !== false) {
//             node.drawInfo = {
//                 uniforms: {
//                     u_colorOffset: [0, 0, 0.6, 0],
//                     u_colorMult: [0.4, 0.4, 0.4, 1],
//                 },
//                 programInfo: programInfo,
//                 bufferInfo: cubeBufferInfo,
//                 vertexArray: cubeVAO,
//             };
//             objectsToDraw.push(node.drawInfo);
//             objects.push(node);
//         }
//         makeNodes(nodeDescription.children).forEach(function (child) {
//             child.setParent(node);
//         });
//         return node;
//     }

//     function makeNodes(nodeDescriptions) {
//         return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
//     }

//     var scene = makeNode(blockGuyNodeDescriptions);

//     requestAnimationFrame(drawScene);

//     // Draw the scene.
//     function drawScene(time) {
//         time *= 0.001;

//         twgl.resizeCanvasToDisplaySize(gl.canvas);

//         // Tell WebGL how to convert from clip space to pixels
//         gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//         gl.enable(gl.CULL_FACE);
//         gl.enable(gl.DEPTH_TEST);

//         // Compute the projection matrix
//         var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//         var projectionMatrix = m4.perspective(
//             fieldOfViewRadians,
//             aspect,
//             1,
//             200
//         );

//         // Compute the camera's matrix using look at.
//         var cameraPosition = [4, 3.5, 10];
//         var target = [0, 3.5, 0];
//         var up = [0, 1, 0];
//         var cameraMatrix = m4.lookAt(cameraPosition, target, up);

//         // Make a view matrix from the camera matrix.
//         var viewMatrix = m4.inverse(cameraMatrix);

//         var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

//         var adjust;
//         var speed = 3;
//         var c = time * speed;
//         adjust = Math.abs(Math.sin(c));
//         nodeInfosByName["point between feet"].trs.translation[1] = adjust;
//         adjust = Math.sin(c);
//         nodeInfosByName["left-leg"].trs.rotation[0] = adjust;
//         nodeInfosByName["right-leg"].trs.rotation[0] = -adjust;
//         adjust = Math.sin(c + 0.1) * 0.4;
//         nodeInfosByName["left-calf"].trs.rotation[0] = -adjust;
//         nodeInfosByName["right-calf"].trs.rotation[0] = adjust;
//         adjust = Math.sin(c + 0.1) * 0.4;
//         nodeInfosByName["left-foot"].trs.rotation[0] = -adjust;
//         nodeInfosByName["right-foot"].trs.rotation[0] = adjust;

//         adjust = Math.sin(c) * 0.4;
//         nodeInfosByName["left-arm"].trs.rotation[2] = adjust;
//         nodeInfosByName["right-arm"].trs.rotation[2] = adjust;
//         adjust = Math.sin(c + 0.1) * 0.4;
//         nodeInfosByName["left-forearm"].trs.rotation[2] = adjust;
//         nodeInfosByName["right-forearm"].trs.rotation[2] = adjust;
//         adjust = Math.sin(c - 0.1) * 0.4;
//         nodeInfosByName["left-hand"].trs.rotation[2] = adjust;
//         nodeInfosByName["right-hand"].trs.rotation[2] = adjust;

//         adjust = Math.sin(c) * 0.4;
//         nodeInfosByName["waist"].trs.rotation[1] = adjust;
//         adjust = Math.sin(c) * 0.4;
//         nodeInfosByName["torso"].trs.rotation[1] = adjust;
//         adjust = Math.sin(c + 0.25) * 0.4;
//         nodeInfosByName["neck"].trs.rotation[1] = adjust;
//         adjust = Math.sin(c + 0.5) * 0.4;
//         nodeInfosByName["head"].trs.rotation[1] = adjust;
//         adjust = Math.cos(c * 2) * 0.4;
//         nodeInfosByName["head"].trs.rotation[0] = adjust;

//         // Update all world matrices in the scene graph
//         scene.updateWorldMatrix();

//         // Compute all the matrices for rendering
//         objects.forEach(function (object) {
//             object.drawInfo.uniforms.u_matrix = m4.multiply(
//                 viewProjectionMatrix,
//                 object.worldMatrix
//             );
//         });

//         // ------ Draw the objects --------

//         twgl.drawObjectList(gl, objectsToDraw);

//         requestAnimationFrame(drawScene);
//     }
// }
