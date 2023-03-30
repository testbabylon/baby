import { float, int, Mesh, VertexData, Vector3, VertexBuffer, Matrix, Geometry, Scene, Engine, HemisphericLight, DirectionalLight, MeshBuilder, Camera, ArcFollowCamera, ArcRotateCamera, Color4, FlyCamera, Vector4 } from "@babylonjs/core";
import Pako = require("pako");
import { ByteReader } from "../Common/ByteHelper";
import { BOOL, FALSE, TRUE } from "../Common/types";

const zlib = Pako;

export class GXD
{

	public static Engine: Engine;
	public static Scene: Scene;
    public static Canvas: HTMLCanvasElement;
	public static ArcCamera: ArcRotateCamera;
	public static Camera: Camera;

	public static async Init()
	{
		document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        GXD.Canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        GXD.Canvas = document.createElement("canvas");
        GXD.Canvas.style.width = "100%";
        GXD.Canvas.style.height = "100%";
        GXD.Canvas.id = "renderCanvas";
        document.body.appendChild(GXD.Canvas);

        GXD.Engine = new Engine(GXD.Canvas, true);
        GXD.Scene = new Scene(GXD.Engine);

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), GXD.Scene);        
        //const box = MeshBuilder.CreateBox("box", {}, GXD.Scene);
        
        GXD.ArcCamera = new ArcRotateCamera("ArcCamera", -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 10, 0), GXD.Scene);
		GXD.ArcCamera.setPosition( new Vector3( 0, 5, -28 ) );
		GXD.ArcCamera.setTarget( new Vector3( 0, 10, 0 ) );
        GXD.ArcCamera.attachControl( GXD.Canvas, true );

        //GXD.Camera = new Camera("camera", new Vector3( 0, 0, 0 ), GXD.Scene, true );
		//GXD.Camera.fov = 45;
		//GXD.Camera.inertia = Camera.PERSPECTIVE_CAMERA;
		//GXD.Camera.position = new Vector3( 0.0, 5.0, -28.0 );
		//GXD.Camera.upVector = new Vector3( 0, 10.0, 0 );
        //GXD.Camera.attachControl( GXD.Canvas, true );

	}
}