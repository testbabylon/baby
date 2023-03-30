import { DDSTools, float, int, Matrix, Mesh, Vector3, VertexBuffer, VertexData, _DDSTextureLoader } from "@babylonjs/core";
import { ByteReader, CopyArray } from "../Common/ByteHelper";
import { GXD } from "./Core";
import { LOAD_FOR_GXD } from "./LOAD_FOR_GXD";
import { MOTION_FOR_GXD } from "./MOTION_FOR_GXD";
import { TEXTURE_FOR_GXD } from "./TEXTURE_FOR_GXD";
import { BOOL, FALSE, TRUE, WORD } from "../Common/types";
import { Zlib, ZLibDataPtr } from "../Common/Zlib";


export class SKINSIZE_FOR_GXD
{
	/**
	* @property float[3]
	*/
	mBoxMin: float[];
	/**
	* @property float[3]
	*/
	mBoxMax: float[];
	/**
	* @property float[3]
	*/
	mCenter: float[];
	mRadius: float;
	constructor( r: ByteReader )
	{
		this.mBoxMin = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mBoxMax = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mCenter = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mRadius = r.ReadFloat();
	}
}

export class SKINVERTEX_FOR_GXD
{
	/**
	* @property float[3]
	*/
    mV: float[];
	/**
	* @property float[3]
	*/
	mN: float[];
	/**
	* @property float[2]
	*/
	mT: float[];
	constructor( r?: ByteReader )
	{
        if( !r )
        {
            var u8 = new Uint8Array( 4*(3+3+2) );
            r = new ByteReader( u8 );
        }
		this.mV = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mN = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mT = [r.ReadFloat(), r.ReadFloat()];
	}
}

export class SKININDEX_FOR_GXD
{
	/**
	 * @property WORD[3]
	 */
    mFace: WORD[];
	constructor( r: ByteReader )
	{
		this.mFace = [r.ReadUShort(), r.ReadUShort(), r.ReadUShort()];
	}
}

export class SKINWEIGHT_FOR_GXD
{
	/**
	* @property int[4]
	*/
	mBoneIndex: int[];
	/**
	* @property float[4]
	*/
	mBlendValue: float[];
	constructor( r: ByteReader )
	{
		this.mBoneIndex = [r.ReadInt(), r.ReadInt(), r.ReadInt(), r.ReadInt()];
		this.mBlendValue = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
	}
}

export class SKINEFFECT_FOR_GXD
{
	mCheckTwoSide : BOOL;
	mCheckRadiation : BOOL;
	mRadiationSpeed : float;
	/**
	* @property float[4]
	*/
	mRadiationLowLimit : float[];
	/**
	* @property float[4]
	*/
	mRadiationHighLimit : float[];
	mCheckLightBright : BOOL;
	mCheckCameraSpecularEffect : BOOL;
	mCameraSpecularEffectSort: int;
	/**
	* @property float[4]
	*/
	mCameraSpecularEffectMaterialValue : float[];
	mCameraSpecularEffectMaterialPower: float;
	mCameraSpecularEffectLightAddValue: float;
	mCheckTextureAnimation : BOOL;
	mTextureAnimationSpeed: float;
	mCheckUVScroll1 : BOOL;
	mUVScrollSort1: int;
	mUVScrollSpeed1: float;
	mCheckBillboard : BOOL;
	mBillboardSort: int;
	mCheckUVScroll2 : BOOL;
	mUVScrollSort2: int;
	mUVScrollSpeed2: float;
	constructor( r: ByteReader )
	{
		this.mCheckTwoSide = r.ReadBOOL();
		this.mCheckRadiation = r.ReadBOOL();
		this.mRadiationSpeed = r.ReadFloat();
		this.mRadiationLowLimit = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mRadiationHighLimit = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mCheckLightBright = r.ReadBOOL();
		this.mCheckCameraSpecularEffect = r.ReadBOOL();
		this.mCameraSpecularEffectSort = r.ReadInt();
		this.mCameraSpecularEffectMaterialValue = [r.ReadFloat(), r.ReadFloat(), r.ReadFloat(), r.ReadFloat()];
		this.mCameraSpecularEffectMaterialPower = r.ReadFloat();
		this.mCameraSpecularEffectLightAddValue = r.ReadFloat();
		this.mCheckTextureAnimation = r.ReadBOOL();
		this.mTextureAnimationSpeed = r.ReadFloat();
		this.mCheckUVScroll1 = r.ReadBOOL();
		this.mUVScrollSort1 = r.ReadInt();
		this.mUVScrollSpeed1 = r.ReadFloat();
		this.mCheckBillboard = r.ReadBOOL();
		this.mBillboardSort = r.ReadInt();
		this.mCheckUVScroll2 = r.ReadBOOL();
		this.mUVScrollSort2 = r.ReadInt();
		this.mUVScrollSpeed2 = r.ReadFloat();
	}
}


export class SKINMOTION_FOR_GXD
{
	/**
	* @property float[3]
	*/
	mMotionVertex: float[];
	/**
	* @property float[3]
	*/
	mMotionNormal: float[];
	constructor( r: SKINVERTEX_FOR_GXD )
	{
		this.mMotionVertex = [ r.mV[0], r.mV[1], r.mV[2] ];
		this.mMotionNormal = [ r.mN[0], r.mN[1], r.mN[2] ];
	}
}

export class SKIN_FOR_GXD extends LOAD_FOR_GXD
{
//private:

	mVertexBufferForBillboard: SKINVERTEX_FOR_GXD[];//SKINVERTEX_FOR_GXD[4]

	mCheckChangeNormalState: BOOL;
	mScaleValue: Vector3;		/** Scale ฐช. */
	mSize: SKINSIZE_FOR_GXD;
	mScaleKeyMatrix: Matrix[];//D3DXMATRIX*

//public:
    mCheckValidState: BOOL;
    mEffect: SKINEFFECT_FOR_GXD;
	mVertexNum: number;
	mUVNum: number;
	mWeightNum: number;
	mTrisNum: number;
	mVertex: float[];
	mNormal: float[];
	mUV: float[];
	mWeight: float[];
	mTris: WORD[];
	//mVertexBuffer: SKINVERTEX_FOR_GXD[];
	mWeightBuffer: SKINWEIGHT_FOR_GXD[];
	//mIndexBuffer: SKININDEX_FOR_GXD[];
	mMotionVertex: float[];
	mMotionNormal: float[];
	//mSkinMotion: SKINMOTION_FOR_GXD[];
    /**
     * @property {TEXTURE_FOR_GXD[2]}
     */
	mTexture: TEXTURE_FOR_GXD[];
	mTextureAnimationNum: int;
	//TEXTURE_FOR_GXD *mTextureAnimation;
    //DWORD       m_dwDyeingColor;

	//--------------------------------------------------------------------------------------------------------------------
	// SkinForGXDฟกผญ นวมธสภป ร฿ฐก วฯฑโ ภงวั บฏผ๖ ร฿ฐก
	// 2010.03.10 : ฑ่ผบผ๖
	///< DDS ฦฤภฯทฮ บฮลอ heightmapภป ภะพ๎ผญ bumpmapฟก ป็ฟ๋วา Normalmapภป ปผบวัดู.
	//TEXTURE_FOR_GXD			mBumpTexture; ///< bumpmappingภป ภงวั normap ภป ภ๚ภๅวฯฑโ ภงวั บฏผ๖ : 2008.10.21 ฑ่ผบผ๖
	//TEXTURE_FOR_GXD			mSpeculerTexture; ///< speculermappingภป ภงวั normap ภป ภ๚ภๅวฯฑโ ภงวั บฏผ๖ : 2010.05.17 : ฑ่ผบผ๖
    mbIsUseBumpmap: BOOL; ///< bumpmappingภป ป็ฟ๋วาม๖ฟก ด๋วั ฟฉบฮ : 2008.11.10 ฑ่ผบผ๖
    mbIsUseSpeculer: BOOL; ///< speculermappingภป ป็ฟ๋วาม๖ฟก ด๋วั ฟฉบฮ : 2010.05.17 : ฑ่ผบผ๖
	//BUMPEFFECT_FOR_GXD		mBumpEffect;
	//bool					m_bIsViewBumpLight;
	//--------------------------------------------------------------------------------------------------------------------
	mMesh: Mesh;
	
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
        this.mVertexBufferForBillboard = [];
        //this.mVertexBuffer = [];
        this.mVertex = [];
        this.mNormal = [];
        this.mUV = [];
        this.mTris = [];
        this.mWeightBuffer = [];
        //this.mIndexBuffer = [];
        this.mMotionVertex = [];
        this.mMotionNormal = [];
        //this.mSkinMotion = [];
        this.mTexture = [];
        this.mScaleValue = new Vector3( 1, 1, 1 );
        this.mScaleKeyMatrix = [];
        this.mTextureAnimationNum = 0;
        this.mbIsUseBumpmap = FALSE;
        this.mbIsUseSpeculer = FALSE;
        this.mMesh = null;
    }

	Load( r: ByteReader, tCheckCreateTexture: BOOL, tCheckRemoveFileData: BOOL ) : BOOL
	{
		if( this.mCheckValidState )
			return FALSE;
		this.mCheckValidState = r.ReadBOOL();
		if( !this.mCheckValidState )
			return TRUE;
		this.mCheckValidState = FALSE;

		var z: ZLibDataPtr = new ZLibDataPtr( r );
		if( !Zlib.Decompress( z ) )
		{
			return FALSE;
		}
		var sr = new ByteReader( z.tOriginal );
		this.mEffect = new SKINEFFECT_FOR_GXD( sr );
		this.mVertexNum = sr.ReadInt();
		this.mUVNum = sr.ReadInt();
		this.mWeightNum = sr.ReadInt();
		this.mTrisNum = sr.ReadInt();
		this.mSize = new SKINSIZE_FOR_GXD( sr );

		var str = "";
        str += "mVertexNum:"+ this.mVertexNum;
		str += "\tmUVNum:"+ this.mUVNum;
		str += "\tmWeightNum:"+ this.mWeightNum;
		str += "\tmTrisNum:"+ this.mTrisNum;
        console.log(str);

        if ( this.mVertexNum == 4 && this.mUVNum == 4 && this.mTrisNum == 2 )
        {
            this.mVertexBufferForBillboard[0] = new SKINVERTEX_FOR_GXD();
            var Src:SKINVERTEX_FOR_GXD[] = [];
            Src[0] = new SKINVERTEX_FOR_GXD( sr );
            Src[1] = new SKINVERTEX_FOR_GXD( sr );
            Src[2] = new SKINVERTEX_FOR_GXD( sr );
            Src[3] = new SKINVERTEX_FOR_GXD( sr );
            var v36 = [];
            CopyArray( v36, 0, Src[0].mT, 0, 2 );
            CopyArray( v36, 2, Src[1].mT, 0, 2 );
            CopyArray( v36, 4, Src[2].mT, 0, 2 );
            CopyArray( v36, 6, Src[3].mT, 0, 2 );
            var v41 = [ v36[0], v36[1] ];
            var v43 = [ v36[0], v36[1] ];
            for ( i = 1; i < 4; i++ )
            {
                if ( v36[2 * i] > v41 )
                    v41 = v36[2 * i];
                if ( v36[2 * i] < v43[0] )
                    v43[0] = v36[2 * i];
                if ( v36[2 * i + 1] > v41[1] )
                    v41[1] = v36[2 * i + 1];
                if ( v36[2 * i + 1] < v43[1] )
                    v43[1] = v36[2 * i + 1];
            }
            this.mVertexBufferForBillboard[0].mN[0] = 0.0;
            this.mVertexBufferForBillboard[0].mN[1] = 0.0;
            this.mVertexBufferForBillboard[0].mN[2] = 0.0;
            this.mVertexBufferForBillboard[0].mT[0] = v43[0];
            this.mVertexBufferForBillboard[0].mT[1] = v41[1];
            this.mVertexBufferForBillboard[1].mN[0] = 0.0;
            this.mVertexBufferForBillboard[1].mN[1] = 0.0;
            this.mVertexBufferForBillboard[1].mN[2] = 0.0;
            this.mVertexBufferForBillboard[1].mT[0] = v43[0];
            this.mVertexBufferForBillboard[2].mN[0] = 0.0;
            this.mVertexBufferForBillboard[2].mN[1] = 0.0;
            this.mVertexBufferForBillboard[2].mN[2] = 0.0;
            this.mVertexBufferForBillboard[2].mT[0] = v41[0];
            this.mVertexBufferForBillboard[2].mT[1] = v41[1];
            this.mVertexBufferForBillboard[3].mN[0] = 0.0;
            this.mVertexBufferForBillboard[3].mN[1] = 0.0;
            this.mVertexBufferForBillboard[3].mN[2] = 0.0;
            this.mVertexBufferForBillboard[3].mT[0] = v41[0];
            this.mVertexBufferForBillboard[3].mT[1] = v43[1];
            
            for ( i = 1; i < 4; i++ )
            {
                //this.mSkinMotion[i] = new SKINMOTION_FOR_GXD( this.mVertexBufferForBillboard[i] );
                let smotion = new SKINMOTION_FOR_GXD( this.mVertexBufferForBillboard[i] );
                CopyArray( this.mMotionVertex, i*3, smotion.mMotionVertex, 0, 3 );
                CopyArray( this.mMotionNormal, i*3, smotion.mMotionNormal, 0, 3 );
            }
        }
        else
        {
            for( var i = 0; i < this.mVertexNum; i++ )
            {
                //this.mVertexBuffer[i] = new SKINVERTEX_FOR_GXD( sr );
                let vtb = new SKINVERTEX_FOR_GXD( sr );
                CopyArray( this.mVertex, i*3, vtb.mV, 0, 3 );
                CopyArray( this.mNormal, i*3, vtb.mN, 0, 3 );
                CopyArray( this.mUV, i*2, vtb.mT, 0, 2 );
                //this.mSkinMotion[i] = new SKINMOTION_FOR_GXD( this.mVertexBuffer[i] );
                //let smotion = new SKINMOTION_FOR_GXD( vtb );
                CopyArray( this.mMotionVertex, i*3, vtb.mV, 0, 3 );
                CopyArray( this.mMotionNormal, i*3, vtb.mN, 0, 3 );
            }
        }
		for( var i = 0; i < this.mVertexNum; i++ )
		{
			this.mWeightBuffer[i] = new SKINWEIGHT_FOR_GXD( sr );
		}
		for( var i = 0; i < this.mTrisNum; i++ )
		{
			//this.mIndexBuffer[i] = new SKININDEX_FOR_GXD( sr );
            var idb = new SKININDEX_FOR_GXD( sr );
            CopyArray( this.mTris, i*3, idb.mFace, 0, 3 );
		}
        this.mTexture[0] = new TEXTURE_FOR_GXD();
        this.mTexture[1] = new TEXTURE_FOR_GXD();
        if( !this.mTexture[0].Load( r, tCheckCreateTexture, tCheckRemoveFileData ) )
        {
            this.Free();
            return FALSE;
        }
        if( !this.mTexture[1].Load( r, tCheckCreateTexture, tCheckRemoveFileData ) )
        {
            this.Free();
            return FALSE;
        }
        this.mTextureAnimationNum = r.ReadInt();
        //this.mbIsUseBumpmap = r.ReadBOOL();
        //console.log( "this.mTextureAnimationNum", this.mTextureAnimationNum );
        //console.log( "this.mbIsUseBumpmap", this.mbIsUseBumpmap );
        //console.log(r);
    
        this.mMesh = new Mesh( "temp" );
    
        this.ToMesh( 0 );
        this.mMesh.material = this.mTexture[0].GetMaterial();
        this.mMesh.visibility = 0;

        //var mat: Material = new Material("matTmp", GXD.Scene);        
        //console.log(this.mMesh);
    
        this.mCheckValidState = TRUE;
		return TRUE;
	}

    ToMesh( type: int )
    {
        if( type == 0 )
        {
            var vertexData = new VertexData;
            //VertexData.ComputeNormals( position, index, normal );
            vertexData.positions = this.mVertex;
            vertexData.normals = this.mNormal;
            vertexData.uvs = this.mUV;
            vertexData.indices = this.mTris;
            vertexData.applyToMesh( this.mMesh, true );
        }
        else
        {
            this.mMesh.updateVerticesData( VertexBuffer.PositionKind, this.mVertex );
            this.mMesh.updateVerticesData( VertexBuffer.NormalKind, this.mNormal );
            this.mMesh.updateVerticesData( VertexBuffer.UVKind, this.mUV );
            this.mMesh.updateIndices( this.mTris );
        }

    }

    ReadyForDraw( tFrame: int, tMotion: MOTION_FOR_GXD, tCheckCalculateNormal: BOOL )
    {
        //HANDLE v4; // eax
        var v5: Matrix; // eax
        //SIZE_T v6; // [esp+8h] [ebp-114h]
        //D3DXVECTOR3 v8; // [esp+18h] [ebp-104h] BYREF
        //D3DXVECTOR3 v9; // [esp+24h] [ebp-F8h] BYREF
        //D3DXVECTOR3 v10; // [esp+30h] [ebp-ECh] BYREF
        //D3DXVECTOR3 v11; // [esp+3Ch] [ebp-E0h] BYREF
        //D3DXVECTOR3 v12; // [esp+48h] [ebp-D4h] BYREF
        //D3DXVECTOR3 v13; // [esp+54h] [ebp-C8h] BYREF
        //D3DXMATRIX v14; // [esp+60h] [ebp-BCh] BYREF
        var pOut: Vector3; // [esp+A0h] [ebp-7Ch] BYREF
        var v16: Vector3; // [esp+ACh] [ebp-70h] BYREF
        var v17: Vector3; // [esp+ACh] [ebp-70h] BYREF
        var v18: Vector3; // [esp+ACh] [ebp-70h] BYREF
        var v19: Matrix[] = []; // [esp+D0h] [ebp-4Ch]
        var v20: Matrix; // [esp+D4h] [ebp-48h] BYREF
        var i: int; // [esp+118h] [ebp-4h]
      
        if ( !this.mCheckValidState )
        {
            return;
        }
          if ( tMotion.mCheckValidState )
          {
            if ( ( this.mScaleValue.x <= 0.9998999834060669
                || this.mScaleValue.x >= 1.000100016593933
                || this.mScaleValue.y <= 0.9998999834060669
                || this.mScaleValue.y >= 1.000100016593933
                || this.mScaleValue.z <= 0.9998999834060669
                || this.mScaleValue.z >= 1.000100016593933 )
              && !this.mScaleKeyMatrix.length )
            {
              this.mScaleKeyMatrix = new Matrix[ tMotion.mBoneNum << 6 ];
            }
            let mi = tMotion.mBoneNum * tFrame;
            //console.log(mi, this.mScaleKeyMatrix.length);
            if( mi < 1 )
            {
                return;
            }
            for( i = 0; i < mi; i++)
            {
                v19[i] = tMotion.mKeyMatrix[i+mi];
            }
            //v19 = tMotion.mKeyMatrix;
            if ( this.mScaleKeyMatrix )
            {
              v20 = Matrix.Scaling( this.mScaleValue.x, this.mScaleValue.y, this.mScaleValue.z );
              for ( i = 0; i < tMotion.mBoneNum; i++ )
              {
                  this.mScaleKeyMatrix[i] = v19[i].multiply( v20 );
              }
              v19 = this.mScaleKeyMatrix;
            }
            //if ( tCheckCalculateNormal )
            //{
            //  for ( i = 0; i < this.mVertexNum; i++ )
            //  {
            //    var vcMotionVertex = new Vector3( this.mSkinMotion[i].mMotionVertex[0], this.mSkinMotion[i].mMotionVertex[1], this.mSkinMotion[i].mMotionVertex[2] );
            //    pOut = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[0]] );
            //    v16 = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[1]] );
            //    if ( this.mWeightBuffer[i].mBlendValue[2] <= 0.0 )
            //      v17 = new Vector3( 0.0, 0.0, 0.0 );
            //    else
            //      v17 = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[2]] );
            //    if ( this.mWeightBuffer[i].mBlendValue[3] <= 0.0 )
            //      v18 = new Vector3( 0.0, 0.0, 0.0 );
            //    else
            //      v18 = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[3]] );
            //    this.mVertexBuffer[i].mV[0] = pOut.x * this.mWeightBuffer[i].mBlendValue[0]
            //                                 + v16.x * this.mWeightBuffer[i].mBlendValue[1]
            //                                 + v17.x * this.mWeightBuffer[i].mBlendValue[2]
            //                                 + v18.x * this.mWeightBuffer[i].mBlendValue[3];
            //    this.mVertexBuffer[i].mV[1] = pOut.y * this.mWeightBuffer[i].mBlendValue[0]
            //                                 + v16.y * this.mWeightBuffer[i].mBlendValue[1]
            //                                 + v17.y * this.mWeightBuffer[i].mBlendValue[2]
            //                                 + v18.y * this.mWeightBuffer[i].mBlendValue[3];
            //    this.mVertexBuffer[i].mV[2] = pOut.z * this.mWeightBuffer[i].mBlendValue[0]
            //                                 + v16.z * this.mWeightBuffer[i].mBlendValue[1]
            //                                 + v17.z * this.mWeightBuffer[i].mBlendValue[2]
            //                                 + v18.z * this.mWeightBuffer[i].mBlendValue[3];
            //    this.mCheckChangeNormalState = TRUE;
            //    var vcMotionNormal = new Vector3( this.mSkinMotion[i].mMotionNormal[0], this.mSkinMotion[i].mMotionNormal[1], this.mSkinMotion[i].mMotionNormal[2] );
            //    pOut = Vector3.TransformCoordinates( vcMotionNormal, v19[this.mWeightBuffer[i].mBoneIndex[0]] );
            //    v16 = Vector3.TransformCoordinates( vcMotionNormal, v19[this.mWeightBuffer[i].mBoneIndex[1]] );
            //    if ( this.mWeightBuffer[i].mBlendValue[2] <= 0.0 )
            //        v17 = new Vector3( 0.0, 0.0, 0.0 );
            //    else
            //        v17 = Vector3.TransformCoordinates( vcMotionNormal, v19[this.mWeightBuffer[i].mBoneIndex[2]] );
            //    if ( this.mWeightBuffer[i].mBlendValue[3] <= 0.0 )
            //      v18 = new Vector3( 0.0, 0.0, 0.0 );
            //    else
            //      v18 = Vector3.TransformCoordinates( vcMotionNormal, v19[this.mWeightBuffer[i].mBoneIndex[3]] );
            //    this.mVertexBuffer[i].mN[0] = pOut.x * this.mWeightBuffer[i].mBlendValue[0]
            //                                 + v16.x * this.mWeightBuffer[i].mBlendValue[1]
            //                                 + v17.x * this.mWeightBuffer[i].mBlendValue[2]
            //                                 + v18.x * this.mWeightBuffer[i].mBlendValue[3];
            //    this.mVertexBuffer[i].mN[1] = pOut.y * this.mWeightBuffer[i].mBlendValue[0]
            //                                 + v16.y * this.mWeightBuffer[i].mBlendValue[1]
            //                                 + v17.y * this.mWeightBuffer[i].mBlendValue[2]
            //                                 + v18.y * this.mWeightBuffer[i].mBlendValue[3];
            //    this.mVertexBuffer[i].mN[2] = pOut.z * this.mWeightBuffer[i].mBlendValue[0]
            //                                 + v16.z * this.mWeightBuffer[i].mBlendValue[1]
            //                                 + v17.z * this.mWeightBuffer[i].mBlendValue[2]
            //                                 + v18.z * this.mWeightBuffer[i].mBlendValue[3];
            //    var vcNormallize = Vector3.Normalize( new Vector3( this.mVertexBuffer[i].mN[0], this.mVertexBuffer[i].mN[1], this.mVertexBuffer[i].mN[2] ) );
            //    this.mVertexBuffer[i].mN[0] = vcNormallize.x;
            //    this.mVertexBuffer[i].mN[1] = vcNormallize.y;
            //    this.mVertexBuffer[i].mN[2] = vcNormallize.z;
            //  }
            //}
            //else
            {
              for ( i = 0; i < this.mVertexNum; i++ )
              {
                var vcMotionVertex = Vector3.FromArray( this.mMotionVertex, i*3 );
                pOut = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[0]] );
                v16 = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[1]] );
                if ( this.mWeightBuffer[i].mBlendValue[2] <= 0.0 )
                    v17 = new Vector3( 0.0, 0.0, 0.0 );
                else
                    v17 = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[2]] );
                if ( this.mWeightBuffer[i].mBlendValue[3] <= 0.0 )
                  v18 = new Vector3( 0.0, 0.0, 0.0 );
                else
                  v18 = Vector3.TransformCoordinates( vcMotionVertex, v19[this.mWeightBuffer[i].mBoneIndex[3]] );
                this.mVertex[i*3+0] = pOut.x * this.mWeightBuffer[i].mBlendValue[0]
                                             + v16.x * this.mWeightBuffer[i].mBlendValue[1]
                                             + v17.x * this.mWeightBuffer[i].mBlendValue[2]
                                             + v18.x * this.mWeightBuffer[i].mBlendValue[3];
                this.mVertex[i*3+1] = pOut.y * this.mWeightBuffer[i].mBlendValue[0]
                                             + v16.y * this.mWeightBuffer[i].mBlendValue[1]
                                             + v17.y * this.mWeightBuffer[i].mBlendValue[2]
                                             + v18.y * this.mWeightBuffer[i].mBlendValue[3];
                this.mVertex[i*3+2] = pOut.z * this.mWeightBuffer[i].mBlendValue[0]
                                             + v16.z * this.mWeightBuffer[i].mBlendValue[1]
                                             + v17.z * this.mWeightBuffer[i].mBlendValue[2]
                                             + v18.z * this.mWeightBuffer[i].mBlendValue[3];
                //if ( this.mCheckChangeNormalState )
                //{
                //  this.mCheckChangeNormalState = FALSE;
                //  this.mVertexBuffer[i].mN = this.mSkinMotion[i].mMotionNormal;
                //}
              }
            }
          }
          else
          {
            //for ( i = 0; i < this.mVertexNum; ++i )
            //{
            //    this.mVertexBuffer[i].mV = this.mSkinMotion[i].mMotionVertex;
            //    this.mVertexBuffer[i].mN = this.mSkinMotion[i].mMotionNormal;
            //}
          }
        this.ToMesh(1);
    }
    Draw()
    {

    }

    DrawForSelect( tCoord: float[], tAngle: float[] )
    {
        //struct D3DXMATRIX *v1; // eax
        //D3DXVECTOR3 pOut; // [esp+4h] [ebp-5Ch] BYREF
        //float v4; // [esp+10h] [ebp-50h]
        //float v5; // [esp+14h] [ebp-4Ch]
        //D3DXMATRIX v6; // [esp+18h] [ebp-48h] BYREF
        //D3DXVECTOR3 *v7; // [esp+5Ch] [ebp-4h]
      //
        //if ( this.mCheckValidState )
        //{
        //  D3DXVECTOR3::D3DXVECTOR3(&pOut);
        //  D3DXMATRIX::D3DXMATRIX(&v6);
        //  if ( this.mEffect.mCheckBillboard )
        //  {
        //    v1 = D3DXMatrixIdentity(&v6);
        //    ((*mGXD.mGraphicDevice)->SetTransform)(mGXD.mGraphicDevice, 256, v1);
        //    SKIN_FOR_GXD::GetCenterCoord(this, &pOut.x);
        //    D3DXVec3TransformCoord(&pOut, &pOut, &mGXD.mWorldMatrix);
        //    if ( this.mEffect.mBillboardSort == 1 )
        //      v7 = mGXD.mBillboardVertexInfoForAll;
        //    else
        //      v7 = mGXD.mBillboardVertexInfoForY;
        //    v4 = (this.mSize.mBoxMax[0] - this.mSize.mBoxMin[0]) * 0.5;
        //    v5 = (this.mSize.mBoxMax[1] - this.mSize.mBoxMin[1]) * 0.5;
        //    this.mVertexBufferForBillboard[0].mV[0] = pOut.x - v7->x * v4 - v7[1].x * v5;
        //    this.mVertexBufferForBillboard[0].mV[1] = pOut.y - v7->y * v4 - v7[1].y * v5;
        //    this.mVertexBufferForBillboard[0].mV[2] = pOut.z - v7->z * v4 - v7[1].z * v5;
        //    this.mVertexBufferForBillboard[1].mV[0] = pOut.x - v7->x * v4 + v7[1].x * v5;
        //    this.mVertexBufferForBillboard[1].mV[1] = pOut.y - v7->y * v4 + v7[1].y * v5;
        //    this.mVertexBufferForBillboard[1].mV[2] = pOut.z - v7->z * v4 + v7[1].z * v5;
        //    this.mVertexBufferForBillboard[2].mV[0] = v7->x * v4 + pOut.x - v7[1].x * v5;
        //    this.mVertexBufferForBillboard[2].mV[1] = v7->y * v4 + pOut.y - v7[1].y * v5;
        //    this.mVertexBufferForBillboard[2].mV[2] = v7->z * v4 + pOut.z - v7[1].z * v5;
        //    this.mVertexBufferForBillboard[3].mV[0] = v7->x * v4 + pOut.x + v7[1].x * v5;
        //    this.mVertexBufferForBillboard[3].mV[1] = v7->y * v4 + pOut.y + v7[1].y * v5;
        //    this.mVertexBufferForBillboard[3].mV[2] = v7->z * v4 + pOut.z + v7[1].z * v5;
        //    ((*mGXD.mGraphicDevice)->SetTexture)(mGXD.mGraphicDevice, 0, 0);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 7, 0, ".\\S07_GXD.cpp", 2900);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 8, 2u, ".\\S07_GXD.cpp", 2901);
        //    ((*mGXD.mGraphicDevice)->DrawPrimitiveUP)(mGXD.mGraphicDevice, 5, 2, this, 32);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 8, 3u, ".\\S07_GXD.cpp", 2903);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 7, 1u, ".\\S07_GXD.cpp", 2904);
        //    ((*mGXD.mGraphicDevice)->SetTransform)(mGXD.mGraphicDevice, 256, &mGXD.mWorldMatrix);
        //  }
        //  else
        //  {
        //    ((*mGXD.mGraphicDevice)->SetTexture)(mGXD.mGraphicDevice, 0, 0);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 7, 0, ".\\S07_GXD.cpp", 2909);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 8, 2u, ".\\S07_GXD.cpp", 2910);
        //    ((*mGXD.mGraphicDevice)->DrawIndexedPrimitiveUP)(
        //      mGXD.mGraphicDevice,
        //      4,
        //      0,
        //      this.mVertexNum,
        //      this.mTrisNum,
        //      this.mIndexBuffer,
        //      101,
        //      this.mVertexBuffer,
        //      32);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 8, 3u, ".\\S07_GXD.cpp", 2912);
        //    CRenderStateMgr::SetRenderState(&mGXD.m_RenderStateMgr, 7, 1u, ".\\S07_GXD.cpp", 2913);
        //  }
        //}

        this.mMesh.visibility = 1;
        //GXD.Scene.addMesh( this.mMesh );

        this.mMesh.position.x = tCoord[0];
        this.mMesh.position.y = tCoord[1];
        this.mMesh.position.z = tCoord[2];
        this.mMesh.rotation.x = tAngle[0];
        this.mMesh.rotation.y = tAngle[1];
        this.mMesh.rotation.z = tAngle[2];
    }
}