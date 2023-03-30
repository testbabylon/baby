import { BaseTexture, CubeTexture, DDSTools, Effect, FragmentOutputBlock, ImageSourceBlock, InputBlock, int, InternalTexture, InternalTextureSource, Material, NodeMaterial, NodeMaterialSystemValues, ShaderMaterial, StandardMaterial, Texture, TextureBlock, TransformBlock, Vector3, VertexOutputBlock, _DDSTextureLoader } from "@babylonjs/core";
import { ByteReader, ToArrayBuffer, ToArrayBufferView } from "../Common/ByteHelper";
import { GXD } from "./Core";
import { BOOL, TRUE, FALSE, DWORD, BytePtr, UINT } from "../Common/types";
import { Zlib, ZLibDataPtr } from "../Common/Zlib";

export function MAKEFOURCC(ch0:string, ch1:string, ch2:string, ch3:string)
{
    return ( ch0.charCodeAt(0) | (ch1.charCodeAt(0) << 8) | (ch2.charCodeAt(0) << 16) | (ch3.charCodeAt(0) << 24 ) );
}

enum D3DFORMAT
{
    D3DFMT_UNKNOWN              =  0,

    D3DFMT_R8G8B8               = 20,
    D3DFMT_A8R8G8B8             = 21,
    D3DFMT_X8R8G8B8             = 22,
    D3DFMT_R5G6B5               = 23,
    D3DFMT_X1R5G5B5             = 24,
    D3DFMT_A1R5G5B5             = 25,
    D3DFMT_A4R4G4B4             = 26,
    D3DFMT_R3G3B2               = 27,
    D3DFMT_A8                   = 28,
    D3DFMT_A8R3G3B2             = 29,
    D3DFMT_X4R4G4B4             = 30,
    D3DFMT_A2B10G10R10          = 31,
    D3DFMT_A8B8G8R8             = 32,
    D3DFMT_X8B8G8R8             = 33,
    D3DFMT_G16R16               = 34,
    D3DFMT_A2R10G10B10          = 35,
    D3DFMT_A16B16G16R16         = 36,

    D3DFMT_A8P8                 = 40,
    D3DFMT_P8                   = 41,

    D3DFMT_L8                   = 50,
    D3DFMT_A8L8                 = 51,
    D3DFMT_A4L4                 = 52,

    D3DFMT_V8U8                 = 60,
    D3DFMT_L6V5U5               = 61,
    D3DFMT_X8L8V8U8             = 62,
    D3DFMT_Q8W8V8U8             = 63,
    D3DFMT_V16U16               = 64,
    D3DFMT_A2W10V10U10          = 67,

    D3DFMT_UYVY                 = MAKEFOURCC('U', 'Y', 'V', 'Y'),
    D3DFMT_R8G8_B8G8            = MAKEFOURCC('R', 'G', 'B', 'G'),
    D3DFMT_YUY2                 = MAKEFOURCC('Y', 'U', 'Y', '2'),
    D3DFMT_G8R8_G8B8            = MAKEFOURCC('G', 'R', 'G', 'B'),
    D3DFMT_DXT1                 = MAKEFOURCC('D', 'X', 'T', '1'),
    D3DFMT_DXT2                 = MAKEFOURCC('D', 'X', 'T', '2'),
    D3DFMT_DXT3                 = MAKEFOURCC('D', 'X', 'T', '3'),
    D3DFMT_DXT4                 = MAKEFOURCC('D', 'X', 'T', '4'),
    D3DFMT_DXT5                 = MAKEFOURCC('D', 'X', 'T', '5'),

    D3DFMT_D16_LOCKABLE         = 70,
    D3DFMT_D32                  = 71,
    D3DFMT_D15S1                = 73,
    D3DFMT_D24S8                = 75,
    D3DFMT_D24X8                = 77,
    D3DFMT_D24X4S4              = 79,
    D3DFMT_D16                  = 80,

    D3DFMT_D32F_LOCKABLE        = 82,
    D3DFMT_D24FS8               = 83,

/* D3D9Ex only -- */
//#if !defined(D3D_DISABLE_9EX)

    /* Z-Stencil formats valid for CPU access */
    D3DFMT_D32_LOCKABLE         = 84,
    D3DFMT_S8_LOCKABLE          = 85,

//#endif // !D3D_DISABLE_9EX
/* -- D3D9Ex only */


    D3DFMT_L16                  = 81,

    D3DFMT_VERTEXDATA           =100,
    D3DFMT_INDEX16              =101,
    D3DFMT_INDEX32              =102,

    D3DFMT_Q16W16V16U16         =110,

    D3DFMT_MULTI2_ARGB8         = MAKEFOURCC('M','E','T','1'),

    // Floating point surface formats

    // s10e5 formats (16-bits per channel)
    D3DFMT_R16F                 = 111,
    D3DFMT_G16R16F              = 112,
    D3DFMT_A16B16G16R16F        = 113,

    // IEEE s23e8 formats (32-bits per channel)
    D3DFMT_R32F                 = 114,
    D3DFMT_G32R32F              = 115,
    D3DFMT_A32B32G32R32F        = 116,

    D3DFMT_CxV8U8               = 117,

/* D3D9Ex only -- */
//#if !defined(D3D_DISABLE_9EX)

    // Monochrome 1 bit per pixel format
    D3DFMT_A1                   = 118,

    // 2.8 biased fixed point
    D3DFMT_A2B10G10R10_XR_BIAS  = 119,


    // Binary format indicating that the data has no inherent type
    D3DFMT_BINARYBUFFER         = 199,
    
//#endif // !D3D_DISABLE_9EX
/* -- D3D9Ex only */


    D3DFMT_FORCE_DWORD          =0x7fffffff
}

enum D3DRESOURCETYPE {
    D3DRTYPE_SURFACE                =  1,
    D3DRTYPE_VOLUME                 =  2,
    D3DRTYPE_TEXTURE                =  3,
    D3DRTYPE_VOLUMETEXTURE          =  4,
    D3DRTYPE_CUBETEXTURE            =  5,
    D3DRTYPE_VERTEXBUFFER           =  6,
    D3DRTYPE_INDEXBUFFER            =  7,           //if this changes, change _D3DDEVINFO_RESOURCEMANAGER definition


    D3DRTYPE_FORCE_DWORD            = 0x7fffffff
}


enum D3DXIMAGE_FILEFORMAT
{
    D3DXIFF_BMP         = 0,
    D3DXIFF_JPG         = 1,
    D3DXIFF_TGA         = 2,
    D3DXIFF_PNG         = 3,
    D3DXIFF_DDS         = 4,
    D3DXIFF_PPM         = 5,
    D3DXIFF_DIB         = 6,
    D3DXIFF_HDR         = 7,       //high dynamic range formats
    D3DXIFF_PFM         = 8,       //
    D3DXIFF_FORCE_DWORD = 0x7fffffff

};

export class D3DXIMAGE_INFO
{
    Width: UINT;
    Height: UINT;
    Depth: UINT;
    MipLevels: UINT;
    Format: D3DFORMAT;
    ResourceType: D3DRESOURCETYPE;
    ImageFileFormat: D3DXIMAGE_FILEFORMAT;
    Set( r?: ByteReader )
    {
        if( !r )
        {
            var data = new Uint8Array( 28 );
            r = new ByteReader( data );
        }
        this.Width = r.ReadUInt();
        this.Height = r.ReadUInt();
        this.Depth = r.ReadUInt();
        this.MipLevels = r.ReadUInt();
        this.Format = r.ReadInt();
        this.ResourceType = r.ReadUInt();
        this.ImageFileFormat = r.ReadUInt();
    }
}

export class TEXTURE_FOR_GXD
{
    num: number = Math.random();
	mCheckValidState: BOOL;
	mFileDataSize: DWORD;
	mFileData: BytePtr;
	mTextureInfo: D3DXIMAGE_INFO;
	mProcessModeCase: int;
	mAlphaModeCase: int;
    mOrgAlphaModeCase: int;
	mTexture;//IDirect3DTexture9*
    mMaterial: StandardMaterial;
    mShaderMaterial: ShaderMaterial;
    constructor()
    {
        this.mTextureInfo = new D3DXIMAGE_INFO();
        this.Free();
    }
    Init(): void
    {
        this.Free();
    }
    Free(): void
    {
        this.mCheckValidState = FALSE;
        this.mFileData = null;
        this.mFileDataSize = 0;
        this.mProcessModeCase = -1;
        this.mAlphaModeCase = 0;
        this.mOrgAlphaModeCase = 0;
        this.mTexture = 0;
        this.mTextureInfo.Set();
    }
    CheckTwoPowerNumber( tNumber: int ): int
    {
        if ( tNumber < 1 )
            return 0;
        for ( var i = 1; ; i *= 2 )
        {
            if ( i == tNumber )
            return 1;
            if ( i > tNumber )
            break;
        }
        return 0;
    }

    Load( r: ByteReader, tCheckCreateTexture: BOOL, tCheckRemoveFileData: BOOL ): BOOL
    {
        if ( this.mCheckValidState )
            return FALSE;
            
        this.mFileDataSize = r.ReadUInt();
        if( !this.mFileDataSize )
            return TRUE;
        var z: ZLibDataPtr = new ZLibDataPtr( r );
        if( !Zlib.Decompress( z ) )
        {
            this.Free();
            return FALSE;
        }
        var sr: ByteReader = new ByteReader( z.tOriginal );
        this.mFileData = sr.ReadBytePtr( this.mFileDataSize );
        if( this.mFileData.length != this.mFileDataSize )
        {
            this.Free();
            return FALSE;
        }
        this.mProcessModeCase = sr.ReadInt();
        this.mAlphaModeCase = sr.ReadInt();
        
        //https://gist.github.com/jonleighton/958841
        //function base64Uint8Array(bytes) {
        //    var base64    = ''
        //    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        //  
        //    //var bytes         = new Uint8Array(arrayBuffer)
        //    var byteLength    = bytes.byteLength
        //    var byteRemainder = byteLength % 3
        //    var mainLength    = byteLength - byteRemainder
        //  
        //    var a, b, c, d
        //    var chunk
        //  
        //    // Main loop deals with bytes in chunks of 3
        //    for (var i = 0; i < mainLength; i = i + 3) {
        //      // Combine the three bytes into a single integer
        //      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
        //  
        //      // Use bitmasks to extract 6-bit segments from the triplet
        //      a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        //      b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
        //      c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
        //      d = chunk & 63               // 63       = 2^6 - 1
        //  
        //      // Convert the raw binary segments to the appropriate ASCII encoding
        //      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
        //    }
        //  
        //    // Deal with the remaining bytes and padding
        //    if (byteRemainder == 1) {
        //      chunk = bytes[mainLength]
        //  
        //      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
        //  
        //      // Set the 4 least significant bits to zero
        //      b = (chunk & 3)   << 4 // 3   = 2^2 - 1
        //  
        //      base64 += encodings[a] + encodings[b] + '=='
        //    } else if (byteRemainder == 2) {
        //      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
        //  
        //      a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        //      b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
        //  
        //      // Set the 2 least significant bits to zero
        //      c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
        //  
        //      base64 += encodings[a] + encodings[b] + encodings[c] + '='
        //    }
        //    
        //    return base64
        //}        
        //var string = "data:"+base64Uint8Array( this.mFileData );
        //var raw =  Texture.CreateFromBase64String( string, string, GXD.Scene );
        //var raw = Texture.LoadFromDataString( "tt", string, GXD.Scene, true, false, false, Texture.LINEAR_LINEAR );
        //console.log(raw.textureType);

        //var texture = new InternalTexture( GXD.Engine, InternalTextureSource.Unknown );
        //var ddsInfo = DDSTools.GetDDSInfo( this.mFileData );
        //DDSTools.UploadDDSLevels( GXD.Engine, texture, this.mFileData, ddsInfo, false, 0 );
        //var raw = new _DDSTextureLoader();
        //raw.loadData( ToArrayBufferView( this.mFileData ), texture, function(width: number, height: number, loadMipmap: boolean, isCompressed: boolean ) {
        //} );

        this.mMaterial = new StandardMaterial( this.num.toString(), GXD.Scene );
        //this.mMaterial.diffuseTexture = raw.loadCubeData();
        this.mMaterial.backFaceCulling = false;
        this.mMaterial.cullBackFaces = false;


        /*this.mNodeMaterial = new NodeMaterial("node");
        this.mNodeMaterial.backFaceCulling = false;
        this.mNodeMaterial.cullBackFaces = false;

        // InputBlock
        var position = new InputBlock("position");
        position.visibleInInspector = false;
        position.visibleOnFrame = false;
        position.target = 1;
        position.setAsAttribute("position");

        // TransformBlock
        var WorldPos = new TransformBlock("WorldPos");
        WorldPos.visibleInInspector = false;
        WorldPos.visibleOnFrame = false;
        WorldPos.target = 1;
        WorldPos.complementZ = 0;
        WorldPos.complementW = 1;

        // InputBlock
        var World = new InputBlock("World");
        World.visibleInInspector = false;
        World.visibleOnFrame = false;
        World.target = 1;
        World.setAsSystemValue( NodeMaterialSystemValues.World);

        // TransformBlock
        var WorldPosViewProjectionTransform = new TransformBlock("WorldPos * ViewProjectionTransform");
        WorldPosViewProjectionTransform.visibleInInspector = false;
        WorldPosViewProjectionTransform.visibleOnFrame = false;
        WorldPosViewProjectionTransform.target = 1;
        WorldPosViewProjectionTransform.complementZ = 0;
        WorldPosViewProjectionTransform.complementW = 1;

        // InputBlock
        var ViewProjection = new InputBlock("ViewProjection");
        ViewProjection.visibleInInspector = false;
        ViewProjection.visibleOnFrame = false;
        ViewProjection.target = 1;
        ViewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);

        // VertexOutputBlock
        var VertexOutput = new VertexOutputBlock("VertexOutput");
        VertexOutput.visibleInInspector = false;
        VertexOutput.visibleOnFrame = false;
        VertexOutput.target = 1;

        // InputBlock
        var uv = new InputBlock("uv");
        uv.visibleInInspector = false;
        uv.visibleOnFrame = false;
        uv.target = 1;
        uv.setAsAttribute("uv");

        var raw = null;
        // TextureBlock
        var TextureOutput = new TextureBlock("Texture");
        TextureOutput.visibleInInspector = false;
        TextureOutput.visibleOnFrame = false;
        TextureOutput.target = 3;
        TextureOutput.convertToGammaSpace = false;
        TextureOutput.convertToLinearSpace = false;
        TextureOutput.disableLevelMultiplication = false;
        TextureOutput.texture = raw;
        TextureOutput.texture.wrapU = 1;
        TextureOutput.texture.wrapV = 1;
        TextureOutput.texture.uAng = 0;
        TextureOutput.texture.vAng = 0;
        TextureOutput.texture.wAng = 0;
        TextureOutput.texture.uOffset = 0;
        TextureOutput.texture.vOffset = 0;
        TextureOutput.texture.uScale = 1;
        TextureOutput.texture.vScale = 1;
        TextureOutput.texture.coordinatesMode = 7;

        // ImageSourceBlock
        var _ImageSourceBlock = new ImageSourceBlock("ImageSourceBlock");
        _ImageSourceBlock.visibleInInspector = false;
        _ImageSourceBlock.visibleOnFrame = false;
        _ImageSourceBlock.target = 3;
        _ImageSourceBlock.texture = raw
        _ImageSourceBlock.texture.wrapU = 1;
        _ImageSourceBlock.texture.wrapV = 1;
        _ImageSourceBlock.texture.uAng = 0;
        _ImageSourceBlock.texture.vAng = 0;
        _ImageSourceBlock.texture.wAng = 0;
        _ImageSourceBlock.texture.uOffset = 0;
        _ImageSourceBlock.texture.vOffset = 0;
        _ImageSourceBlock.texture.uScale = 1;
        _ImageSourceBlock.texture.vScale = 1;
        _ImageSourceBlock.texture.coordinatesMode = 7;

        // FragmentOutputBlock
        var FragmentOutput = new FragmentOutputBlock("FragmentOutput");
        FragmentOutput.visibleInInspector = false;
        FragmentOutput.visibleOnFrame = false;
        FragmentOutput.target = 2;
        FragmentOutput.convertToGammaSpace = false;
        FragmentOutput.convertToLinearSpace = false;
        FragmentOutput.useLogarithmicDepth = false;

        // Connections
        position.output.connectTo(WorldPos.vector);
        World.output.connectTo(WorldPos.transform);
        WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
        ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
        WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
        uv.output.connectTo(TextureOutput.uv);
        _ImageSourceBlock.source.connectTo(TextureOutput.source);
        TextureOutput.rgba.connectTo(FragmentOutput.rgba);

        // Output nodes
        this.mNodeMaterial.addOutputNode(VertexOutput);
        this.mNodeMaterial.addOutputNode(FragmentOutput);
        this.mNodeMaterial.build();*/



        if ( tCheckCreateTexture )
        {
            //switch ( mGXD.mTextureOptionValue )
            //{
            //    case 0:
            //    ....
            //}
        }
        else
        {
        }
        
        this.mCheckValidState = TRUE;
        if( tCheckRemoveFileData )
        {
            this.mFileData = null;
        }

        return TRUE;
    }

    mNodeMaterial: NodeMaterial;
    GetMaterial() : StandardMaterial
    {
        return this.mMaterial;
        //return this.mNodeMaterial;
        //Effect.ShadersStore["customVertexShader"] =
        //"\r\n" +
        //"precision highp float;\r\n" +
        //"// Attributes\r\n" +
        //"attribute vec3 position;\r\n" +
        //"attribute vec2 uv;\r\n" +
        //"// Uniforms\r\n" +
        //"uniform mat4 worldViewProjection;\r\n" +
        //"// Varying\r\n" +
        //"varying vec2 vUV;\r\n" +
        //"void main(void) {\r\n" +
        //"    gl_Position = worldViewProjection * vec4(position, 1.0);\r\n" +
        //"    vUV = uv;\r\n" +
        //"}\r\n";
        //Effect.ShadersStore["customFragmentShader"] = "\r\n" + "precision highp float;\r\n" + "varying vec2 vUV;\r\n" + "uniform sampler2D textureSampler;\r\n" + "void main(void) {\r\n" + "    gl_FragColor = texture2D(textureSampler, vUV);\r\n" + "}\r\n";

        //if( this.mShaderMaterial )
        //    return this.mShaderMaterial;   
        //this.mShaderMaterial = new ShaderMaterial(
        //    "shader",
        //    GXD.Scene,
        //    {
        //      vertex: "custom",
        //      fragment: "custom",
        //    },
        //    {
        //      attributes: ["position", "normal", "uv", "textureSampler"],
        //      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        //      samplers: ["textureSampler"],
        //      needAlphaBlending: true,
        //      needAlphaTesting: true
        //    },
        //  );
        //this.mShaderMaterial.setTexture( "textureSampler", this.mMaterial.diffuseTexture );
        //this.mShaderMaterial.backFaceCulling = false;
        //this.mShaderMaterial.cullBackFaces = false;
        //return this.mShaderMaterial;
    }
}
