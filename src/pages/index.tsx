import { useEffect, useState } from "react";

import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import type { NextPage } from "next";
import Head from "next/head";
import posthog from "posthog-js";

import Button from "@musicprod/components/shared/Button";
import SovitsInference from "@musicprod/components/SovitsInference";

const NextHead = () => {
  return (
    <Head>
      <title>Music AI</title>
      <meta property="og:title" content="Music AI" key="title" />
      <meta name="description" content="Create Any Song with Any Artist"></meta>
    </Head>
  );
};

const Landing: NextPage = () => {
  const [audio, setAudio] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  useEffect(() => {
    posthog.init("phc_b1IjIo9iTOKwDxiCve7abg82mC4SpKQQqz8hDe1qElR", {
      api_host: "https://app.posthog.com",
    });
    posthog.capture("Landing Page View");
  }, []);

  return (
    <div className="z-10 overflow-x-hidden w-full min-h-screen lg:h-screen lg:overflow-hidden lg:static relative">
      <NextHead />
      <nav className="justify-center py-5 flex w-full gap-9 font-semibold text-lg border-b border-solid border-gray-500">
        <a href="https://create.musicfy.lol/" className=" hover:underline">
          Create
        </a>
        <a href="https://www.musicfy.lol/library" className="hover:underline">
          Discover
        </a>
        <a href="https://www.musicfy.lol/upload" className="hover:underline">
          Upload
        </a>
        <a href="https://www.musicfy.lol/contact" className="hover:underline">
          Contact
        </a>
      </nav>
      <div className="fixed w-[300px] h-[300px] rounded-[50%] bg-gray-500 bottom-[-150px] left-[-150px]" />
      <div className="z-0 absolute lg:hidden w-[250px] h-[250px] rounded-[50%] bg-gray-500 top-[50%] right-[-125px]" />
      <div className="px-9 flex flex-col min-h-screen relative z-10">
        <main className="flex-auto grid xl:grid-rows-3 mt-6 lg:mt-16 xl:mt-0">
          <div className="grid auto-rows-max xl:auto-rows-fr xl:grid-rows-none xl:grid-cols-2 xl:gap-9 row-span-2">
            <div className="col-span-1 relative flex flex-col h-full justify-center text-center xl:text-left">
              <div className="text-48 font-semibold">
                <span
                  className="relative z-0 before:content-[''] before:absolute before:h-4 before:bottom-1 before:-z-10 before:transition-all before:bg-gradient-to-r before:from-transparent before:to-purple before:animate-expand
                  "
                >
                  Create AI Tracks
                </span>{" "}
                🎤
              </div>
              <div className="mb-8" />
              <div className="font-light text-20 hidden lg:block">
                Introducing the future of music production - with our AI-powered
                voice cloning software, you can now clone the voices of your
                favorite music artists and create custom music covers, remixes,
                and more with ease. Whether you're an aspiring musician or a
                seasoned producer, our technology can help you create truly
                unique and personalized music.
              </div>
              <div className="mb-6 lg:mb-12" />
              <div className="xl:flex flex-col hidden">
                {!!audio && !!filename && (
                  <div className="w-full box-content">
                    <audio
                      className="w-full z-10 relative"
                      controls
                      autoPlay
                      src={audio}
                      autoSave="audio.mp3"
                    ></audio>

                    <div className="my-3 flex justify-center">
                      <Button
                        onClick={() => {
                          console.log(audio);
                          const link = document.createElement("a");
                          link.href = audio;
                          link.download = filename; // set the desired filename here
                          link.click();
                          posthog.capture("File Downloaded");
                        }}
                        variant="outlined"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex opacity-0 animate-fadeIn xl:mt-0 lg:mt-6 mt-0">
              <SovitsInference
                setAudioSrc={(objectUrl: string) => {
                  setAudio(objectUrl);
                }}
                setAudioFilename={(filename: string) => {
                  setFilename(filename);
                }}
              />
            </div>
          </div>
          {!!audio && !!filename && (
            <div className="w-full box-content xl:hidden block">
              <audio
                className="w-full z-10 relative"
                controls
                src={audio}
              ></audio>

              <div className="my-3 flex justify-center">
                <Button
                  onClick={() => {
                    console.log(audio);
                    const link = document.createElement("a");
                    link.href = audio;
                    link.download = filename; // set the desired filename here
                    link.click();
                    link.remove();
                    posthog.capture("File Downloaded");
                  }}
                  variant="outlined"
                >
                  Download
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Step: React.FC<{
  Icon?: React.ReactNode;
  title: string;
  description: string;
  index: number;
}> = ({ Icon, title, description, index }) => {
  return (
    <div
      className="animate-fadeInUpRight opacity-[0]"
      style={{
        animationDelay: `${index * 0.1 + 0.2}s`,
      }}
    >
      <div className="flex">
        {Icon}
        <div className="ml-8">
          <div className="font-semibold text-24">{title}</div>
          <div className="mb-3" />
          <div className="font-light leading-6">{description}</div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
