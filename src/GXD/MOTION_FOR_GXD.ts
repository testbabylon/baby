import { int, Matrix, Quaternion, Vector3, Vector4, WebRequest } from "@babylonjs/core";
import { ByteReader } from "../Common/ByteHelper";
import { GXD } from "./Core";
import { LOAD_FOR_GXD } from "./LOAD_FOR_GXD";
import { BOOL, BytePtr, FALSE, TRUE } from "../Common/types";
import { Zlib, ZLibDataPtr } from "../Common/Zlib";

export class MOTION_FOR_GXD extends LOAD_FOR_GXD
{
	mCheckValidState: BOOL;
	mFrameNum: int;
	mBoneNum: int;
	mKeyMatrix: Matrix[] = [];//D3DXMATRIX*

    constructor()
    {
        super();
        this.Free();
    }

    Init() : void
    {
        this.Free();
    }

    Free(): void
    {
        this.mCheckValidState = FALSE;
        this.mFrameNum = 0;
        this.mBoneNum = 0;
        this.mKeyMatrix = [];
    }

    Load( r: ByteReader, tCheckCreateTexture: BOOL, tCheckRemoveFileData: BOOL ) : BOOL
    {
        if ( this.mCheckValidState )
            return FALSE;

        var z: ZLibDataPtr = new ZLibDataPtr( r );
        if( !Zlib.Decompress( z ) )
        {
            return FALSE;
        }

        var sr: ByteReader = new ByteReader( z.tOriginal );
        this.mFrameNum = sr.ReadInt();
        this.mBoneNum = sr.ReadInt();
        var str = "";
        str += "mFrameNum:"+ this.mFrameNum;
        str += "\tmBoneNum:"+ this.mBoneNum;
        console.log( str );

        for( var i = 0; i < this.mFrameNum * this.mBoneNum; i++ )
        {
            var mx: MOTION_MATRIX = new MOTION_MATRIX( sr );
            this.mKeyMatrix[i] = mx.GetMatrix();
            this.mKeyMatrix[i].setRow( 3, new Vector4( mx.mPosition.x, mx.mPosition.y, mx.mPosition.z, 1 ) );//_41, _42, _43, _44
        }
        if( this.mKeyMatrix.length != ( this.mFrameNum * this.mBoneNum ) )
        {
            this.Free();
            return FALSE;
        }
        this.mCheckValidState = TRUE;
        return TRUE;
    }
}

export class MOTION_MATRIX
{
    mQuaternion: Quaternion = new Quaternion;//D3DXQUATERNION;
    mPosition: Vector3 = new Vector3;//D3DXVECTOR3
    mMatrix: Matrix = new Matrix;
    constructor( r: ByteReader )
    {
        this.mQuaternion = new Quaternion( r.ReadFloat(), r.ReadFloat(), r.ReadFloat(), r.ReadFloat() );
        this.mPosition = new Vector3( r.ReadFloat(), r.ReadFloat(), r.ReadFloat() );
    }
    GetMatrix() : Matrix
    {
        this.mQuaternion.toRotationMatrix( this.mMatrix );
        return this.mMatrix;

    }
}