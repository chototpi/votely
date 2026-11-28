"use client";

import { useRef, useState } from "react";
import { Coins, ImagePlus, Minus, Plus, Rocket, Tv, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNav } from "@/lib/votely/nav";
import { POST_COST, useVotely } from "@/lib/votely/store";
import { CATEGORIES, LIMITS, type Category } from "@/lib/votely/types";

export function CreateView() {
  const { vt, createPoll, openAd } = useVotely();
  const { setTab, openPoll } = useNav();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [category, setCategory] = useState<Category | null>(null);
  const [boost, setBoost] = useState(0);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const cost = POST_COST + boost;
  const canAfford = vt >= cost;
  const filledOptions = options.filter((o) => o.trim()).length;
  const isValid = question.trim().length >= 5 && filledOptions >= LIMITS.minOptions;

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((o, i) => (i === index ? value : o)));
  }

  async function compressImage(file: File): Promise<string> {
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    if (file.size > 12 * 1024 * 1024) throw new Error("Each image must be 12 MB or smaller.");
    const source = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image."));
      reader.onerror = () => reject(new Error("Could not read image."));
      reader.readAsDataURL(file);
    });
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This image could not be opened."));
      img.src = source;
    });
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is not supported in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let quality = 0.82;
    let result = canvas.toDataURL("image/jpeg", quality);
    while (result.length > 280_000 && quality > 0.5) {
      quality -= 0.08;
      result = canvas.toDataURL("image/jpeg", quality);
    }
    if (result.length > 320_000) throw new Error("This image is too detailed. Please choose a smaller image.");
    return result;
  }

  async function chooseCover(file?: File) {
    if (!file) return;
    try { setCoverImage(await compressImage(file)); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not process image."); }
  }

  async function chooseGallery(files: FileList | null) {
    if (!files?.length) return;
    const remaining = 4 - galleryImages.length;
    if (remaining <= 0) { toast.error("You can add up to 4 gallery images."); return; }
    try {
      const selected = Array.from(files).slice(0, remaining);
      const processed = await Promise.all(selected.map(compressImage));
      setGalleryImages((current) => [...current, ...processed].slice(0, 4));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not process images."); }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = createPoll({ question, options, category, boost, coverImage, galleryImages });
    if (!result.ok) {
      if (result.reason !== "Not enough VT.") toast.error(result.reason);
      return;
    }
    setQuestion("");
    setOptions(["", ""]);
    setCategory(null);
    setBoost(0);
    setCoverImage(null);
    setGalleryImages([]);
    setTab("home");
    if (result.id) openPoll(result.id);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Create a poll</h1>
        <p className="text-sm text-muted-foreground">Ask the community and see what they think.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="question" className="text-sm font-semibold">
          Your question
        </label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={LIMITS.question}
          rows={3}
          placeholder="What do you want to ask?"
          className="resize-none bg-card text-base"
        />
        <span className="self-end text-xs text-muted-foreground tabular-nums">
          {question.length}/{LIMITS.question}
        </span>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4" aria-labelledby="poll-media-heading">
        <div>
          <h2 id="poll-media-heading" className="text-sm font-semibold">Poll images <span className="font-normal text-muted-foreground">(optional)</span></h2>
          <p className="mt-1 text-xs text-muted-foreground">Add a cover image and up to 4 gallery images to give your poll more context.</p>
        </div>
        <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(event) => { void chooseCover(event.target.files?.[0]); event.target.value = ""; }} />
        <input ref={galleryInput} type="file" accept="image/*" multiple className="hidden" onChange={(event) => { void chooseGallery(event.target.files); event.target.value = ""; }} />
        {coverImage ? (
          <div className="relative overflow-hidden rounded-xl border">
            <img src={coverImage} alt="Poll cover preview" className="aspect-[16/9] w-full object-cover" />
            <div className="absolute right-2 top-2 flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => coverInput.current?.click()}>Change cover</Button>
              <Button type="button" size="icon" variant="secondary" aria-label="Remove cover image" onClick={() => setCoverImage(null)}><X className="size-4" /></Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => coverInput.current?.click()} className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
            <ImagePlus className="size-7" /><span className="text-sm font-semibold">Add cover image</span><span className="text-xs">Recommended landscape image</span>
          </button>
        )}
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-sm font-semibold">Gallery</p><p className="text-xs text-muted-foreground">{galleryImages.length}/4 images</p></div>
          <Button type="button" variant="outline" size="sm" disabled={galleryImages.length >= 4} onClick={() => galleryInput.current?.click()}><Upload className="size-4" /> Add images</Button>
        </div>
        {galleryImages.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{galleryImages.map((image, index) => <div key={`${index}-${image.length}`} className="relative overflow-hidden rounded-lg border"><img src={image} alt={`Gallery preview ${index + 1}`} className="aspect-square w-full object-cover" /><button type="button" aria-label={`Remove gallery image ${index + 1}`} onClick={() => setGalleryImages((items) => items.filter((_, i) => i !== index))} className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/65 text-white"><X className="size-4" /></button></div>)}</div>}
        <p className="text-[11px] leading-relaxed text-muted-foreground">Images are resized in your browser for this frontend demo. Real image hosting and upload security will be implemented with the backend.</p>
      </section>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-semibold">Answer options</legend>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              maxLength={LIMITS.option}
              placeholder={`Option ${index + 1}`}
              aria-label={`Option ${index + 1}`}
              className="bg-card"
            />
            {options.length > LIMITS.minOptions && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove option ${index + 1}`}
                onClick={() => setOptions((current) => current.filter((_, i) => i !== index))}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
        {options.length < LIMITS.maxOptions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setOptions((current) => [...current, ""])}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add option
          </Button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-semibold">Category (optional)</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(category === item ? null : item)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <section aria-labelledby="boost-heading" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Rocket className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id="boost-heading" className="text-sm font-semibold">
              Boost visibility (optional)
            </h2>
            <p className="text-sm text-muted-foreground">
              Spend extra VT to show your poll higher in the feed.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Extra boost</span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Decrease boost"
              disabled={boost === 0}
              onClick={() => setBoost((b) => Math.max(0, b - 1))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-14 text-center font-semibold tabular-nums" aria-live="polite">
              {boost} VT
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Increase boost"
              disabled={boost >= LIMITS.maxBoost}
              onClick={() => setBoost((b) => Math.min(LIMITS.maxBoost, b + 1))}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl bg-secondary p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Coins className="size-4" aria-hidden="true" />
            Posting cost
          </span>
          <span className="font-semibold tabular-nums">{cost} VT</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Your balance</span>
          <span className="tabular-nums">{vt} VT</span>
        </div>
        {!canAfford && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 text-sm">
            <span>You need {cost - vt} more VT to post this.</span>
            <Button type="button" size="sm" onClick={openAd} className="shrink-0">
              <Tv className="size-4" aria-hidden="true" />
              Watch ad
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" disabled={!isValid || !canAfford}>
        Post poll for {cost} VT
      </Button>
    </form>
  );
}
