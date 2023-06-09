import { float, int, Mesh, VertexData } from "@babylonjs/core";
import { ByteReader, CopyArray } from "../../Common/ByteHelper";
import { BOOL, BytePtr, DWORD, FALSE, TRUE, WORD } from "../../Common/types";
import { Zlib, ZLibDataPtr } from "../../Common/Zlib";
import { GXD } from "../Core";
import { LOAD_FOR_GXD } from "../LOAD_FOR_GXD";
import { SKININDEX_FOR_GXD } from "../SKIN_FOR_GXD";
import { TEXTURE_FOR_GXD } from "../TEXTURE_FOR_GXD";

class SKINEFFECT2_FOR_GXD
{
	mAnimationMapInfo: int[];//2
	mRadiationInfo: int[];//10
	mBillboardInfo: int [];//2
    mUnk: int [];//3
    constructor( r: ByteReader )
    {
        this.mAnimationMapInfo = [ r.ReadInt(), r.ReadInt() ];
        this.mRadiationInfo = [ r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt() ];
        this.mBillboardInfo = [ r.ReadInt(), r.ReadInt() ];
        this.mUnk = [ r.ReadInt(), r.ReadInt(), r.ReadInt() ];
    }
}

class SKINVERTEX2_FOR_GXD
{
  mV: float[];//3
  mW: float[];//4
  mB: DWORD;//
  mN1: float[];//3
  mN2: float[];//3
  mN3: float[];//3
  mT: float[];//2
  constructor( r: ByteReader )
  {
    this.mV = [ r.ReadFloat(), r.ReadFloat(), r.ReadFloat() ];
    this.mW = [ r.ReadFloat(), r.ReadFloat(), r.ReadFloat(), r.ReadFloat() ];
    this.mB = r.ReadUInt();
    this.mN1 = [ r.ReadFloat(), r.ReadFloat(), r.ReadFloat() ];
    this.mN2 = [ r.ReadFloat(), r.ReadFloat(), r.ReadFloat() ];
    this.mN3 = [ r.ReadFloat(), r.ReadFloat(), r.ReadFloat() ];
    this.mT = [ r.ReadFloat(), r.ReadFloat() ];
  }
}

class SKINSHADOWVERTEX2_FOR_GXD
{
    mV: float[];//3
    mW: float[];//4
    mB: DWORD;//
    constructor( r: ByteReader )
    {
        this.mV = [ r.ReadFloat(), r.ReadFloat(), r.ReadFloat() ];
        this.mW = [ r.ReadFloat(), r.ReadFloat(), r.ReadFloat(), r.ReadFloat() ];
        this.mB = r.ReadUInt();
    }
}


export class SOBJECT2_FOR_GXD extends LOAD_FOR_GXD
{
    mCheckValidState: BOOL;
    mSkinNum: int;
    mSKin: SKIN2_FOR_GXD[];
    constructor()
    {
        super();
        this.Free();
    }
    Init(): void
    {
        this.Free();
    }
    Free(): void
    {
        this.mCheckValidState = FALSE;
        this.mSkinNum = 0;
        for( var i = 0; i < this.mSkinNum; i++ )
        {
            this.mSKin[i].Free();
        }
        this.mSKin = [];
    }
    
	Load( r: ByteReader, tCheckCreateTexture: BOOL, tCheckRemoveFileData: BOOL ) : BOOL
	{
		if( this.mCheckValidState )
			return FALSE;
		this.mCheckValidState = TRUE;
        var tResult: int[] = [0];
        if( !this.LoadHeader( r, tResult ) )
        {
            console.log( `!this.LoadHeader( ${r}, ${tResult[0]} )` );
            return FALSE;
        }
        console.log( `this.LoadHeader( ${r}, ${tResult[0]} )` );

        var tCheckValid: int[] = [0];
        var tCheckCompress: int[] = [0];
        if( tResult[0] == 3 )//SOBJECT3
        {
            if( !this.LoadExtraHeader( r, tCheckValid, tCheckCompress ) )
            {
                console.log( `!this.LoadExtraHeader( ${r}, ${tCheckValid[0]}, ${tCheckCompress[0]} )` );
                return FALSE;
            }
            console.log( `this.LoadExtraHeader( ${r}, ${tCheckValid[0]}, ${tCheckCompress[0]} )` );
            if( tCheckCompress[0] == 1 )
            {
                if( !this.LoadCompressedChunk( r ) )
                {
                    return FALSE;
                }
            }
        }
		return TRUE;
	}

    LoadHeader( r: ByteReader, tResult: int[] ): BOOL
    {
        if( !r.CheckValid(8) )
        {
            return FALSE;
        }
        var Buffer = r.ReadString( 8 );
        if( Buffer.length == 8 && Buffer.substr(0, 7) == "SOBJECT" )
        {
            tResult[0] = parseInt( Buffer[7] );
            console.log( tResult[0] );
            if( tResult[0] == 2 || tResult[0] == 3 )//SOBJECT2 or SOBJECT3
            {
                return TRUE;
            }
        }
        return FALSE;
    }

    LoadExtraHeader( r: ByteReader, tCheckValid: int[], tCheckCompress: int[] ) : BOOL
    {
        //00 01 02 03 04 05 06 07 08 09 0A 0B
        //53 4F 42 4A 45 43 54 33 01 01 00 00
        //check offset 08 and 09
        if( !r.CheckValid(4) )
        {
            return FALSE;
        }

        //08 09 0A 0B
        //01 01 00 00
        var Buffer = r.ReadBytePtr(4);
        tCheckValid[0] = Buffer[0];
        tCheckCompress[0] = Buffer[1];
        if( tCheckValid[0] == 1 && ( tCheckCompress[0] == 0 || tCheckCompress[0] == 1 ) )
        {
            return TRUE;
        }
        return FALSE;
    }

    LoadCompressedChunk( r: ByteReader ) : BOOL
    {
        var z = new ZLibDataPtr( r );
        if( !Zlib.Decompress( z ) )
        {
            console.log( `!Zlib.Decompress( ${z} ) ` );
            return FALSE;
        }
        var sr = new ByteReader( z.tOriginal );
        console.log(sr);
        this.mSkinNum = sr.ReadInt();
        console.log( `this.mSkinNum = ${this.mSkinNum}` );
        if( !this.mCheckValidState )
        {
            return TRUE;
        }
        //this.mSkinNum = 1;//test
        for( var i = 0; i < this.mSkinNum; i++ )
        {
            this.mSKin[i] = new SKIN2_FOR_GXD();
        }
        for( var i = 0; i < this.mSkinNum; i++ )
        {
            if( !this.mSKin[i].Load2( sr, i ) )
            {
                return FALSE;
            }
            //sr.ReadBytePtr(68);
            //sr.ReadBytePtr(304);
            //console.log( sr.GetRemainData() );
            //break;
        }

        return TRUE;
    }
}

class SKIN2_FOR_GXD
{
    mCheckValidState: BOOL
    mLODStepNum: int;
    mEffect: SKINEFFECT2_FOR_GXD;
    mVertexBufferForBillboard: SKINVERTEX2_FOR_GXD[];
    mVertexNum: number[];
    mVertexBuffer: SKINVERTEX2_FOR_GXD[][];
    mTrisNum: number[];
    mIndexBuffer: SKININDEX_FOR_GXD[][];
    mShadowVertexBuffer: SKINSHADOWVERTEX2_FOR_GXD[][];
    mShadowIndexBuffer: SKININDEX_FOR_GXD[][];
    mShadowEdgeBuffer: SKININDEX_FOR_GXD[][];
    mDiffuseMap: TEXTURE_FOR_GXD;
    mNormalMap: TEXTURE_FOR_GXD;
    mSpecularMap: TEXTURE_FOR_GXD;
    mAnimationMapNum: int;
    constructor()
    {
        this.Free();
    }
    Init(): void
    {
        this.Free();
    }
    Free(): void
    {
        this.mCheckValidState = FALSE;
        this.mVertexBufferForBillboard = [];
        this.mVertexNum = [];
        this.mVertexBuffer = [];
        this.mTrisNum = [];
        this.mIndexBuffer = [];
        this.mShadowVertexBuffer = [];
        this.mShadowIndexBuffer = [];
        this.mShadowEdgeBuffer = [];
    }

    Load2( r: ByteReader, tSkinNum: number ): BOOL
    {
        if( this.mCheckValidState )
        {
            return FALSE;
        }
        this.mCheckValidState = r.ReadBOOL();
        if( !this.mCheckValidState )
        {
            return TRUE;
        }

        this.mEffect = new SKINEFFECT2_FOR_GXD( r );
        this.mVertexBufferForBillboard = [ new SKINVERTEX2_FOR_GXD( r ), new SKINVERTEX2_FOR_GXD( r ), new SKINVERTEX2_FOR_GXD( r ), new SKINVERTEX2_FOR_GXD( r ) ];
        this.mLODStepNum = r.ReadInt();
        console.log( "Skin = ", tSkinNum, "LOD = ", this.mLODStepNum );
        
        let i, j;
        for ( i = 0; i < this.mLODStepNum; i++ )
        {
            this.mVertexNum[i] = 0;
            this.mVertexBuffer[i] = [];
            this.mTrisNum[i] = 0;
            this.mIndexBuffer[i] = [];
        }
        if( this.mLODStepNum > 0 )
        {
            this.mMesh = [];
            for ( i = 0; i < this.mLODStepNum; i++ )
            {
                this.mMesh[i] = null;
                this.mVertexNum[i] = r.ReadInt();
                this.mVertexBuffer[i] = [];
                for( j = 0; j < this.mVertexNum[i]; j++ )
                {
                    this.mVertexBuffer[i][j] = new SKINVERTEX2_FOR_GXD( r );
                }
                this.mTrisNum[i] = r.ReadInt();
                console.log( "LOD = ", i, "VertexNum = ", this.mVertexNum[i], "mTrisNum = ", this.mTrisNum[i] );
                this.mIndexBuffer[i] = [];
                for( j = 0; j < this.mTrisNum[i]; j++ )
                {
                    this.mIndexBuffer[i][j] = new SKININDEX_FOR_GXD( r );
                }
                this.mShadowVertexBuffer[i] = [];
                for( j = 0; j < this.mVertexNum[i]; j++ )
                {
                    this.mShadowVertexBuffer[i][j] = new SKINSHADOWVERTEX2_FOR_GXD( r );
                }
                this.mShadowIndexBuffer[i] = [];
                for( j = 0; j < this.mTrisNum[i]; j++ )
                {
                    this.mShadowIndexBuffer[i][j] = new SKININDEX_FOR_GXD( r );
                }
                this.mShadowEdgeBuffer[i] = [];
                for( j = 0; j < this.mTrisNum[i]; j++ )
                {
                    this.mShadowEdgeBuffer[i][j] = new SKININDEX_FOR_GXD( r );
                }

                this.mMesh[i] = this.ToMesh( this.mMesh[i], i );
                GXD.Scene.addMesh( this.mMesh[i] );
            }
        }

        this.mDiffuseMap = new TEXTURE_FOR_GXD();
        if( !this.mDiffuseMap.Load( r, TRUE, FALSE ) )
        {
            return FALSE;
        }
        this.mNormalMap = new TEXTURE_FOR_GXD();
        if( !this.mNormalMap.Load( r, TRUE, FALSE ) )
        {
            return FALSE;
        }
        this.mSpecularMap = new TEXTURE_FOR_GXD();
        if( !this.mSpecularMap.Load( r, TRUE, FALSE ) )
        {
            return FALSE;
        }

        this.mAnimationMapNum = r.ReadInt();
        console.log( "Skin = ", tSkinNum, "mAnimationMapNum = ", this.mAnimationMapNum );
        if( this.mAnimationMapNum < 1 )
            return TRUE;

        /*
        for( i = 0; i < this.mAnimationMapNum; i++ )
        {
            this.mAnimationMap[i] = new TEXTURE_FOR_GXD();
            this.mAnimationMap[i].Load( r );
        }
        */
        
        
        return TRUE;
    }

    mMesh: Mesh[];
    ToMesh( mesh: Mesh, lod: number ): Mesh
    {
        var positions: Float32Array = new Float32Array( this.mVertexNum[lod] * 3 );
        var normals: Float32Array = new Float32Array( this.mVertexNum[lod] * 3 );
        var uvs: Float32Array = new Float32Array( this.mVertexNum[lod] * 2 );
        var indices: Int32Array = new Int32Array( this.mTrisNum[lod] * 3 );
        var weights: Float32Array = new Float32Array( this.mVertexNum[lod] * 4 );
        for( var i = 0; i < this.mVertexNum[lod]; i++ )
        {
            CopyArray( positions, i*3, this.mVertexBuffer[lod][i].mV, 0, 3 );
            CopyArray( weights, i*4, this.mVertexBuffer[lod][i].mW, 0, 4 );
            
            CopyArray( normals, i*3, this.mVertexBuffer[lod][i].mN3, 0, 3 );
            CopyArray( uvs, i*2, this.mVertexBuffer[lod][i].mT, 0, 2 );
        }
        for( var i = 0; i < this.mTrisNum[lod]; i++ )
        {
            CopyArray( indices, i*3, this.mIndexBuffer[lod][i].mFace, 0, 3 );
        }
        /*
        D3DVERTEXELEMENT9 elements_d3dvertex[] =
        {
            {0,  0, D3DDECLTYPE_FLOAT3, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_POSITION, 0},
            {0, 12, D3DDECLTYPE_FLOAT4, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_BLENDWEIGHT, 0},
            {0, 28, D3DDECLTYPE_D3DCOLOR, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_BLENDINDICES, 0},
            {0, 32, D3DDECLTYPE_FLOAT3, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_TANGENT, 0},
            {0, 44, D3DDECLTYPE_FLOAT3, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_BINORMAL, 0},
            {0, 56, D3DDECLTYPE_FLOAT3, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_NORMAL, 0},
            {0, 68, D3DDECLTYPE_FLOAT2, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_TEXCOORD, 0},
            D3DDECL_END()
        };
          mV: float[];
            mW: float[];
            mB: DWORD;
            mN1: float[];
            mN2: float[];
            mN3: float[];
            mT: float[];
        */

        var vertexData = new VertexData;
        //VertexData.ComputeNormals( position, index, normal );
        vertexData.positions = positions;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        vertexData.indices = indices;
        vertexData.matricesWeights = weights;
        if( !( mesh instanceof Mesh ) )
            mesh = new Mesh("temp");
        vertexData.applyToMesh( mesh, true );
        return mesh;
    }
}