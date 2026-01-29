import Image from "next/image";
import ImageRow from "./components/ImageRow";
import {urlsrow1, roourls1, urlsrow3, urlslapres, urlsedie, urlsgrandcordprint, urlsprojecta, urlsrow4, urlsrow5, urlsunion,urlsjinniphone, jinnishome, grandcordurls1, grandcordurls2, grandcordurls3, ediehomescreen, posterurls, posterurls2} from "@/app/urls";

export default function Home() {
    return (
        <div className="flex w-screen font-mono text-[8.5pt] flex-col  px-2 overflow-y-auto scrollbar-hide">
            <video
                src="https://firebasestorage.googleapis.com/v0/b/common-base-d538e.firebasestorage.app/o/common-design-spinner.MOV?alt=media&token=b62f41cc-fb22-4ecd-a0bb-c04b24f9e66a"
                autoPlay
                loop

                muted
                playsInline
                className="fixed top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none -z-10"
                style={{ height: '40px', width: 'auto' }}
            />
            <div className="fixed w-full flex tracking-[0.9] items-center justify-center pt-2">
                <div className="flex items-center -ml-5 gap-2">
                    <span>daniel crowley</span>
                    <span>[]</span>
                    <span>selected work</span>
                </div>
            </div>

            <div className="pt-[41vh] space-y-12 lg:pt-2">


                <div className=" lg:py-0 mb-6">
                    <p className="mb-2"> [] - grand cord (print) </p>
                    <ImageRow urls={urlsgrandcordprint} height={200} />
                </div>

                <div className=" lg:py-0 mb-6">
                    <p className="mb-2"> [] - grand cord (web) </p>
                    <ImageRow urls={grandcordurls1} height={200} margins={['','border-[0.5] -my-4']} />
                </div>
                <div className=" lg:py-0 mb-6">
                    <p className="mb-2"> [] - event promotion </p>
                    <ImageRow urls={posterurls} height={310} />
                </div>

                <div className=" lg:py-0 mb-6">
                    <p className="mb-2"> [] - edie xu artist portfolio </p>
                    <ImageRow urls={ediehomescreen} height={200} margins={['border-[1]']} />
                </div>










                <div className="mb-6 space-y-4">
                    <p className="mb-2"> [] roo product display pages</p>
                    <ImageRow urls={roourls1} height={200}/>
                </div>
                <div className="mb-6">
                    <p className="mb-2"> [] union splash </p>
                    <ImageRow urls={urlsrow1} height={200}/>
                </div>



                <div className="pt-12 lg:py-0 mb-6">
                    <p className="mb-2"> [] event promotion</p>
                    <ImageRow urls={posterurls2} height={240} />
                </div>

                <div className="mb-6">
                    <p className="mb-2"> [] jing yi artist portfolio</p>
                    <ImageRow urls={urlsrow3} height={200} margins={['','mx-2']}/>
                </div>
                <div className="mb-6">
                    <p className="mb-2"> [] project a e-commerce design</p>
                    <ImageRow urls={urlsprojecta} height={200}/>


                </div>

                <div className="mb-6">
                    <p className="mb-2"> [] jing yi additional</p>
                    <ImageRow urls={urlsjinniphone} height={240} margins={['-mx-8 -my-1']}/>
                </div>






                <div className="mb-6">
                    <p className="mb-2"> [] edie xu additional</p>
                    <ImageRow urls={urlsedie} height={200} margins={['-mx-8 -mt-2']}/>
                </div>

                <div className="mb-6">
                    <p className="mb-2"> [] lapres coffee (native ios)</p>
                    <ImageRow urls={urlslapres} height={200}/>
                </div>
                <div className="mb-6">
                    <p className="mb-2"> [] union deck & sketches</p>
                    <ImageRow urls={urlsunion} height={200}/>
                </div>







                <div className="pt-12 lg:py-0 mb-6">
                    <p className="mb-2"> [] 1 </p>
                    <ImageRow urls={grandcordurls2} height={200}  />
                    <ImageRow urls={grandcordurls3} height={200}  />
                </div>


            </div>

        </div>
    );
}
