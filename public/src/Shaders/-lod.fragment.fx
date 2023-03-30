precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float lod;
uniform vec2 texSize;
void main(void)
{
    gl_FragColor = textureLod(textureSampler,vUV,lod);
}