import { float, int, Vector3 } from "@babylonjs/core";
import { BOOL, BYTE, byte, BytePtr, DWORD, FALSE, short, TRUE, UINT, UShort } from "./types";

enum DataType {
	Int8 = 0,
	Uint8,
	Int16,
	Uint16,
	Int32,
	Uint32,
	Float32,
	Float64,
	String
}

export class ByteReader
{
	private data: BytePtr;//Byte*
	private offset: int[] = [0];//offset[0] like ref ptr
	constructor( data: BytePtr, offset?: int )
	{
		this.data = data;
		this.offset[0] = offset | 0;
	}
	GetOffset(): int { return this.offset[0]; }
	GetRemainData()
	{
		this.data = this.data.slice( this.offset[0], this.offset[0]+(this.data.length-this.offset[0]) );
		this.offset[0] = 0;
		return this;
	}
	CheckValid( tNumberToCheck: int ): BOOL
	{
		return this.offset[0] + tNumberToCheck <= this.data.length;
	}
	AddReadSize( readSize: int )
	{
		this.offset[0] += readSize;
	}
	Get( length: number, type: DataType ) : byte | BYTE | int | DWORD | UINT | short | UShort
	{
		var view = new DataView( new ArrayBuffer( length ) );
		for( var i = 0; i < length; i++ )
		{
			switch( type )
			{
			case DataType.Int8: view.setInt8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			case DataType.Uint8: view.setUint8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			case DataType.Int16: view.setInt8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			case DataType.Uint16: view.setUint8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			case DataType.Int32: view.setInt8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			case DataType.Uint32: view.setUint8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			case DataType.Float32: view.setInt8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			case DataType.Float64: view.setUint8( i, this.data[(this.offset[0]+(length-1-i))] ); break;
			default: return 0;
			}
		}
		this.AddReadSize(view.byteLength);
		switch( type )
		{
		case DataType.Int8: return view.getInt8(0);
		case DataType.Uint8: return view.getUint8(0);
		case DataType.Int16: return view.getInt16(0);
		case DataType.Uint16: return view.getUint16(0);
		case DataType.Int32: return view.getInt32(0);
		case DataType.Uint32: return view.getUint32(0);
		case DataType.Float32: return view.getFloat32(0);
		case DataType.Float64: return view.getFloat64(0);
		default: return 0;
		}
	}
	ReadByte(): byte
	{
		return this.Get( 1, DataType.Int8 );
	}
	ReadBYTE(): BYTE
	{
		return this.Get( 1, DataType.Uint8 );
	}
	ReadBytePtr( NumOfReadBytes: int ): BytePtr
	{
		var value: BytePtr = new Uint8Array( this.data.slice( this.offset[0], this.offset[0]+NumOfReadBytes ) );
		this.AddReadSize(NumOfReadBytes);
		return value;
	}
	ReadBOOL(): BOOL
	{
		return ( this.ReadInt() === 1 ? TRUE : FALSE );
	}
	ReadShort(): int
	{
		return this.Get( 2, DataType.Int16 );
	}
	ReadUShort(): int
	{
		return this.Get( 2, DataType.Uint16 );
	}
	ReadInt(): int
	{
		return this.Get( 4, DataType.Int32 );
	}
	ReadUInt(): UINT
	{
		return this.Get( 4, DataType.Uint32 );
	}
	ReadFloat(): float
	{
		return this.Get( 4, DataType.Float32 );
	}
	ReadString( NumOfReadBytes: int ): string
	{
		var view = new DataView( ToArrayBuffer( this.ReadBytePtr( NumOfReadBytes ) ) );
		var str = new TextDecoder("utf8").decode( view );
		return str;
	}
}

export function CopyArray( arr1, index1, arr2, index2, numToCopy )
{
	for( var i = 0; i < numToCopy; i++ )
	{
		arr1[index1+i] = arr2[index2+i];
	}
}

export function ToArrayBuffer( data: Uint8Array )
{
	var uint8 = new Uint8Array( data );
    const buffer = new ArrayBuffer( uint8.length );
    const view = new DataView( buffer );
    for( let i = 0; i < uint8.length; i++ )
    {
        view.setUint8( i, uint8[i] );
    }
    return view.buffer;
}

export function ToArrayBufferView( data: Uint8Array )
{
	var uint8 = new Uint8Array( data );
    const buffer = new ArrayBuffer( uint8.length );
    const view = new DataView( buffer );
    for( let i = 0; i < uint8.length; i++ )
    {
        view.setUint8( i, uint8[i] );
    }
    return view;
}

export function Vector3ToArray( pV: Vector3, arr: Array<number> | Float32Array, index: number ): void
{
	arr[index*3+0] = pV.x;
	arr[index*3+1] = pV.y;
	arr[index*3+2] = pV.z;
}

export function ArrayToVector3( arr: Array<number> | Float32Array, index: number, pV: Vector3 ): void
{
	pV.x = arr[index*3+0];
	pV.y = arr[index*3+1];
	pV.z = arr[index*3+2];
}