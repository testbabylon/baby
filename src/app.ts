import { GXD } from "./GXD/Core";
import { SOBJECT_FOR_GXD } from "./GXD/SOBJECT_FOR_GXD";
import { MOTION_FOR_GXD } from "./GXD/MOTION_FOR_GXD";
import { Color4, DebugLayer } from "@babylonjs/core";
import { SOBJECT2_FOR_GXD } from "./GXD/2/SOBJECT2_FOR_GXD";

class App {
    hair:SOBJECT_FOR_GXD;
    face:SOBJECT_FOR_GXD;
    body:SOBJECT_FOR_GXD;
    foot:SOBJECT_FOR_GXD;
    weapon:SOBJECT_FOR_GXD;
    motion:MOTION_FOR_GXD[] = [];
    custom: SOBJECT2_FOR_GXD;
    custom2: SOBJECT2_FOR_GXD;
    constructor() {

        this.main();
    }
    private async main(): Promise<void> {
        GXD.Init();
        
        this.hair = new SOBJECT_FOR_GXD();
        this.face = new SOBJECT_FOR_GXD();
        this.body = new SOBJECT_FOR_GXD();
        this.foot = new SOBJECT_FOR_GXD();
        this.weapon = new SOBJECT_FOR_GXD();
        this.motion = [];
        this.motion[0] = new MOTION_FOR_GXD();
        this.motion[1] = new MOTION_FOR_GXD();

        this.custom = new SOBJECT2_FOR_GXD();
        this.custom2 = new SOBJECT2_FOR_GXD();

        var tFrame = 1;
        var dTime = 0.0;
        var tCurrMotion = 0;
        
        var available = ['-astc.ktx', '-dxt.ktx', '-pvrtc.ktx', '-etc2.ktx', '-etc1.ktx'];
        var formatUsed = GXD.Engine.setTextureFormatToUse(available);
        await GXD.Scene.whenReadyAsync();
        new DebugLayer( GXD.Scene ).show();

        var fps = 30;
        this.Load();

        GXD.Engine.runRenderLoop(() => {
        
        //setInterval( () =>{
            dTime += ( fps * 0.01 );
            GXD.Scene.clearColor = new Color4( 0, 0, 0, 1 );
            tFrame = Math.floor( dTime * 1 );
            if( this.motion[tCurrMotion].mCheckValidState && tFrame > this.motion[tCurrMotion].mFrameNum  ) {
                dTime = 1;
                tFrame = 1;
                tCurrMotion++;
                if( tCurrMotion == 2 )
                    tCurrMotion = 0;
            }
            this.Draw(tFrame, this.motion[tCurrMotion]);
            GXD.Scene?.render();
        });    
        //}, 1000/fps );
    }

    Load()
    {
        //this.motion[0].LoadUrl( this.motion[0], "C001001002.MOTION" );//level-idle
        //this.motion[1].LoadUrl( this.motion[1], "C001001078.MOTION" );//master-idle
        //this.hair.LoadUrl( this.hair, "C001001001.SOBJECT" );
        //this.face.LoadUrl( this.face, "C001002001.SOBJECT" );
        //this.body.LoadUrl( this.body, "C001003000.SOBJECT" );
        //this.foot.LoadUrl( this.foot, "C001004001.SOBJECT" );
        //this.weapon.LoadUrl( this.weapon, "C001006035.SOBJECT" );
        
        this.custom.LoadUrl( this.custom, "2/Y001001.SOBJECT" );
        //this.custom2.LoadUrl( this.custom2, "2/M001002001.SOBJECT" );

    }
    Draw(tFrame, tMotion)
    {
        //for( var i = 0; i < this.hair.mSkinNum; i++ )
        //    this.hair.DrawForSelect  ( i, tFrame, [ 0, 0, 0 ], [ 0, 0, 0], tMotion, 20.0 );
        //for( var i = 0; i < this.face.mSkinNum; i++ )
        //    this.face.DrawForSelect  ( i, tFrame, [ 0, 0, 0 ], [ 0, 0, 0], tMotion, 20.0 );        
        //for( var i = 0; i < this.body.mSkinNum; i++ )
        //    this.body.DrawForSelect  ( i, tFrame, [ 0, 0, 0 ], [ 0, 0, 0], tMotion, 20.0 ); 
        //for( var i = 0; i < this.foot.mSkinNum; i++ )
        //    this.foot.DrawForSelect  ( i, tFrame, [ 0, 0, 0 ], [ 0, 0, 0], tMotion, 20.0 );
        //for( var i = 0; i < this.weapon.mSkinNum; i++ )
        //    this.weapon.DrawForSelect( i, tFrame, [ 0, 0, 0 ], [ 0, 0, 0], tMotion, 20.0 );
    }
}

new App();
