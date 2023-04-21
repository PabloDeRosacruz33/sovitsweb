import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Popover from "@mui/material/Popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Switch from "@mui/material/Switch";
import { useDropzone } from "react-dropzone";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import { BeatLoader } from "react-spinners";

import { F0Method, InferenceParams, Model } from "@musicprod/types/sovitsTypes";
import models from "@musicprod/constants/models";
import clsx from "clsx";
import Button from "@musicprod/components/shared/Button";
import posthog from "posthog-js";

enum PresetConfigs {
  singing = "singing",
  rapping = "rapping",
}

const SINGING_CONFIG = {
  pitchPredict: false,
  transpose: 0,
  f0Method: F0Method.crepe,
  noiseScale: 0.4,
};

const RAPPING_CONFIG = {
  pitchPredict: true,
  transpose: 0,
  f0Method: F0Method.dio,
  noiseScale: 0.4,
};

const isValidAudioFile = (file: File): boolean => {
  return (
    file.type === "audio/mpeg" ||
    file.type === "audio/mp3" ||
    file.type === "audio/wav"
  );
};

interface SovitsInferenceProps {
  setAudioSrc: (filename: string) => void;
  setAudioFilename: (filename: string) => void;
}

const SovitsInference: React.FC<SovitsInferenceProps> = ({
  setAudioSrc,
  setAudioFilename,
}) => {
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  const [selectedModel, setSelectedModel] = useState<Model | null>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transpose, setTranspose] = useState<number>(SINGING_CONFIG.transpose);
  const [pitchPredict, setPitchPredict] = useState<boolean>(
    SINGING_CONFIG.pitchPredict
  );
  const [noiseScale, setNoiseScale] = useState<number>(
    SINGING_CONFIG.noiseScale
  );
  const [f0Method, setF0Method] = useState<F0Method>(SINGING_CONFIG.f0Method);

  const [advancedSettingsAnchorEl, setAdvancedSettingsAnchorEl] =
    useState<HTMLDivElement | null>(null);
  const [presetConfig, setPresetConfig] = useState<PresetConfigs>(
    PresetConfigs.singing
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [dropDownContainerWidth, setDropDownContainerWidth] =
    useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    let file = acceptedFiles[0];

    if (!isValidAudioFile(file)) {
      alert("Please upload a valid audio file");
      return;
    }

    const blob = file.slice(0, file.size);

    // clean up filename
    let filename = file.name.replace(/[ '\-\(\)]/g, "_");
    filename = filename.replace(/[$%]/g, "");
    filename = filename.replace(/[^a-zA-Z0-9.]/g, "_");
    file = new File([file], filename, {
      type: file.type,
    });

    setAudioFilename(file.name);
    setUploadedFile(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
    },
    maxFiles: 1,
  });

  const cloneAudio = useCallback(async () => {
    setErrorMessage("");
    setIsLoading(true);
    setAudioSrc("");
    if (!selectedModel) {
      setErrorMessage("Please select an artist");
      setIsLoading(false);
      return;
    }

    if (!uploadedFile) {
      setErrorMessage("Please upload an audio file");
      setIsLoading(false);
      return;
    }

    const inferenceParams: InferenceParams = {
      model: selectedModel.modelVal,
      pitch_predict: pitchPredict,
      transpose: transpose,
      f0_method: f0Method,
      noise_scale: noiseScale,
    };

    posthog.capture("Infer Audio", {
      $set: {
        model: selectedModel.modelVal,
        pitch_predict: pitchPredict,
        transpose: transpose,
        f0_method: f0Method,
        noise_scale: noiseScale,
      },
    });

    const payload = new FormData();
    payload.append("file", uploadedFile as Blob);
    payload.append("inferenceParams", JSON.stringify(inferenceParams));
    try {
      const response: Response = await fetch(
        // "https://sovits-app--sovits-fastapi-app-chrislee973-dev.modal.run/infer_upload_file",
        "https://sovits-app--sovits-fastapi-app.modal.run/infer_upload_file",
        {
          method: "POST",
          body: payload,
          headers: {
            Authorization: `Bearer foobar`,
          },
        }
      );
      const convertedAudioBlob = await response.blob();
      const clonedAudio = URL.createObjectURL(convertedAudioBlob);
      setAudioSrc(clonedAudio);
      setIsLoading(false);
      posthog.capture("Cloned Audio Success", {
        $set: {
          model: selectedModel.modelVal,
          pitch_predict: pitchPredict,
          transpose: transpose,
          f0_method: f0Method,
          noise_scale: noiseScale,
        },
      });
    } catch (err) {
      const error = err;
      setErrorMessage("Something went wrong 🚧");
      setIsLoading(false);
      posthog.capture("Cloned Audio Failure", {
        $set: {
          model: selectedModel.modelVal,
          pitch_predict: pitchPredict,
          transpose: transpose,
          f0_method: f0Method,
          noise_scale: noiseScale,
        },
      });
    }
  }, [
    selectedModel,
    uploadedFile,
    transpose,
    pitchPredict,
    noiseScale,
    f0Method,
    setErrorMessage,
    setIsLoading,
  ]);

  useEffect(() => {
    if (!dropdownContainerRef.current) return;

    setDropDownContainerWidth(
      dropdownContainerRef.current.getBoundingClientRect().width
    );
  }, []);

  return (
    <>
      {isLoading && (
        <div className="w-screen h-screen fixed flex items-center justify-center z-50 bg-[rgba(0,0,0,.5)] left-0 top-0 ">
          <div className="relative w-3/4 h-3/4 flex items-center justify-center">
            <iframe
              src="https://www.musicfy.lol/library"
              className="w-full h-full absolute"
            />
            <div className="bg-white p-5 rounded-4 text-black font-semibold w-full text-center z-20 absolute bottom-0">
              <div>
                Browse some community created AI tracks while we create your
                remix (~2 min)
              </div>
              <div className="mt-3"></div>
              <BeatLoader color="black" className="m-auto" />
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center justify-center lg:w-3/4 w-full m-auto gap-5 z-10">
        <div
          {...getRootProps()}
          className={clsx(
            "max-w-[300px] lg:max-w-full cursor-pointer group hover:border-light-purple transition-all w-full flex flex-col items-center border-dashed rounded-[16px] border-purple border-4 lg:p-12 p-4",
            {
              "border-light-purple": isDragActive,
            }
          )}
        >
          <input {...getInputProps()} accept="audio/mp3,audio/wav" />
          {!!uploadedFile ? (
            <CheckCircleIcon
              className={clsx(
                "fill-purple w-16 h-16 group-hover:fill-light-purple transition-colors",
                {
                  "fill-light-purple": isDragActive,
                }
              )}
            />
          ) : (
            <LibraryMusicIcon
              className={clsx(
                "fill-purple w-16 h-16 group-hover:fill-light-purple transition-colors",
                {
                  "fill-light-purple": isDragActive,
                }
              )}
            />
          )}
          <div className="mt-4" />
          <div
            className={clsx(
              "text-purple font-semibold text-20 text-center group-hover:text-light-purple transition-colors truncate max-w-full",
              {
                "text-light-purple": isDragActive,
              }
            )}
          >
            {!!uploadedFile ? uploadedFile.name : "Select Audio File"}
          </div>
          <div className="text-center mt-3 font-light">
            {!!uploadedFile ? "File Uploaded" : "or drag and drop it here"}
          </div>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div
              ref={dropdownContainerRef}
              className="w-full cursor-pointer bg-purple p-5 rounded-8 flex items-center justify-between"
            >
              <div className="font-semibold">
                {!!selectedModel ? selectedModel.name : "Select an Artist"}
              </div>
              <ArrowDropDownIcon />
            </div>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            style={{
              width: dropDownContainerWidth,
            }}
            className="bg-white rounded-[16px] max-h-72 overflow-y-scroll p-2"
            sideOffset={5}
          >
            {models.map((model) => {
              const isModelSelected =
                selectedModel?.modelVal === model.modelVal;
              return (
                <DropdownMenu.Item
                  key={model.modelVal}
                  onClick={() => {
                    setSelectedModel(model);
                  }}
                  className={clsx(
                    "text-black mb-1 p-2 cursor-pointer hover:outline-none transition-colors group hover:bg-purple hover:text-white rounded-8",
                    {
                      "bg-purple !text-white": isModelSelected,
                    }
                  )}
                >
                  <div className="font-bold text-18">{model.name}</div>
                  <div className="mt-2 font-light text-12">
                    Trained by {model.creator}
                  </div>
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <div className="w-full bg-white rounded-8 p-2 grid grid-cols-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setPresetConfig(PresetConfigs.singing);
              setTranspose(SINGING_CONFIG.transpose);
              setPitchPredict(SINGING_CONFIG.pitchPredict);
              setNoiseScale(SINGING_CONFIG.noiseScale);
              setF0Method(SINGING_CONFIG.f0Method);
            }}
            className={clsx(
              "p-2 cursor-pointer capitalize text-center rounded-8 font-semibold",
              {
                "bg-purple text-white": presetConfig === PresetConfigs.singing,
                "text-purple": presetConfig !== PresetConfigs.singing,
              }
            )}
          >
            {PresetConfigs.singing}
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setPresetConfig(PresetConfigs.rapping);
              setTranspose(RAPPING_CONFIG.transpose);
              setPitchPredict(RAPPING_CONFIG.pitchPredict);
              setNoiseScale(RAPPING_CONFIG.noiseScale);
              setF0Method(RAPPING_CONFIG.f0Method);
            }}
            className={clsx(
              "p-2 cursor-pointer capitalize text-center rounded-8 font-semibold",
              {
                "bg-purple text-white": presetConfig === PresetConfigs.rapping,
                "text-purple": presetConfig !== PresetConfigs.rapping,
              }
            )}
          >
            {PresetConfigs.rapping}
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => setAdvancedSettingsAnchorEl(e.currentTarget)}
          className="cursor-pointer w-full rounded-8 font-semibold border-2 border-solid border-purple p-5 text-center"
        >
          Advanced Settings
        </div>
        <Popover
          open={!!advancedSettingsAnchorEl}
          anchorEl={advancedSettingsAnchorEl}
          onClose={() => setAdvancedSettingsAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: -5,
            horizontal: "center",
          }}
          className="!bg-transparent rounded-8"
        >
          <div
            style={{
              width: dropDownContainerWidth,
            }}
            className="p-5 rounded-8 flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>Pitch Prediction</div>
              <Switch
                checked={pitchPredict}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPitchPredict(e.target.checked)
                }
              />
            </div>
            <div className="flex items-center justify-between gap-6">
              <div>F0 Method</div>
              <Select
                className="w-full"
                value={f0Method}
                onChange={(e: SelectChangeEvent<F0Method>) => {
                  setF0Method(e.target.value as F0Method);
                }}
              >
                <MenuItem value={F0Method.crepe}>{F0Method.crepe}</MenuItem>
                <MenuItem value={F0Method.dio}>{F0Method.dio}</MenuItem>
                <MenuItem value={F0Method.crepeTiny}>
                  {F0Method.crepeTiny}
                </MenuItem>
                <MenuItem value={F0Method.parselmouth}>
                  {F0Method.parselmouth}
                </MenuItem>
                <MenuItem value={F0Method.harvest}>{F0Method.harvest}</MenuItem>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>Transpose</div>
              <Slider
                value={transpose}
                step={1}
                min={-12}
                max={12}
                size="small"
                onChange={(e, value) => {
                  setTranspose(value as number);
                }}
              />
              <div>{transpose}</div>
            </div>
          </div>
        </Popover>
        <div className="flex w-full">
          <Button onClick={cloneAudio} className="w-full">
            Convert
          </Button>
        </div>
        <div className="font-light text-15 hidden lg:block">
          🚨 Use vocals only + songs shorter than 2 minute
        </div>
        {!!errorMessage && <div className="text-red-light">{errorMessage}</div>}
      </div>
    </>
  );
};

export default SovitsInference;
