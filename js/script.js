
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Student image fade
  const students = [...document.querySelectorAll(".student-slide")];
  let studentIndex = Math.max(
    0,
    students.findIndex(student => student.classList.contains("is-active"))
  );

  if (students.length > 1) {
    const showStudent = index => {
      studentIndex = (index + 1) % students.length;

      students.forEach((student, i) => {
        const active = i === studentIndex;

        student.classList.toggle("is-active", active);
        student.setAttribute("aria-hidden", String(!active));
      });
    };

    let studentTimer = null;

    const startStudentSlider = () => {
      clearInterval(studentTimer);

      if (reducedMotion.matches) return;

      studentTimer = setInterval(() => {
        if (!document.hidden) {
          showStudent(studentIndex);
        }
      }, 3000);
    };

    startStudentSlider();

    reducedMotion.addEventListener("change", startStudentSlider);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(studentTimer);
      else startStudentSlider();
    });
  }

  // Recognition carousel
  const carousel = document.querySelector("#recognitionCarousel");
  const dotsContainer = document.querySelector(".recognition-dots");

  if (!carousel || !dotsContainer) return;

  const track = carousel.querySelector(".recognition-track");

  if (!track) return;

  const slides = [...track.querySelectorAll(".recognition-slide")];

  if (slides.length !== 3) return;

  const longList = slides[1].querySelector(".recognition-long-list");
  const longCards = longList
    ? [...longList.querySelectorAll(".recognition-long-row")]
    : [];

  const isMobile = () => window.innerWidth <= 575;

  let index = 0;
  let timer = null;
  let dots = [];
  let previousMobileState = isMobile();

  const getSlideCount = () => isMobile() ? 4 : 3;

  function createDots() {
    const count = getSlideCount();
    const fragment = document.createDocumentFragment();

    dotsContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.setAttribute("aria-label", `Show recognition slide ${i + 1}`);
      dot.setAttribute("aria-pressed", "false");

      dot.addEventListener("click", () => {
        showSlide(i);
        startAutoplay();
      });

      fragment.appendChild(dot);
    }

    dotsContainer.appendChild(fragment);
    dots = [...dotsContainer.querySelectorAll("button")];
  }

  function showInnerCard(i) {
    if (!longList || !longCards[i]) return;

    const card = longCards[i];

    const left =
      card.offsetLeft - longList.offsetLeft;

    longList.scrollTo({
      left,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  }

  function showSlide(i) {
    const mobile = isMobile();
    const count = getSlideCount();

    index = (i + count) % count;

    if (mobile) {
      const position = index === 0 ? 0 : index === 3 ? 2 : 1;

      track.style.transform = `translateX(-${position * 100}%)`;

      if (index === 1 || index === 2) {
        showInnerCard(index - 1);
      }

      slides.forEach((slide, n) => {
        const active =
          index === 0 ? n === 0 :
          index === 3 ? n === 2 :
          n === 1;

        slide.setAttribute("aria-hidden", String(!active));
      });

    } else {
      track.style.transform = `translateX(-${index * 100}%)`;

      slides.forEach((slide, n) => {
        slide.setAttribute("aria-hidden", String(n !== index));
      });
    }

    dots.forEach((dot, n) => {
      const active = n === index;

      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
  }

  function startAutoplay() {
    clearInterval(timer);

    if (reducedMotion.matches || document.hidden) return;

    timer = setInterval(() => {
      if (
        !carousel.matches(":hover") &&
        !carousel.matches(":focus-within") &&
        carousel.getClientRects().length
      ) {
        showSlide(index + 1);
      }
    }, isMobile() ? 3000 : 2000);
  }

  function handleResize() {
    const currentMobileState = isMobile();

    if (previousMobileState !== currentMobileState) {
      previousMobileState = currentMobileState;
      index = 0;

      createDots();
      showSlide(0);
    }

    startAutoplay();
  }

  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", startAutoplay);

  carousel.addEventListener("focusin", () => clearInterval(timer));
  carousel.addEventListener("focusout", startAutoplay);

  document.addEventListener("visibilitychange", startAutoplay);

  reducedMotion.addEventListener("change", startAutoplay);

  window.addEventListener("resize", handleResize, { passive: true });

  createDots();
  showSlide(0);
  startAutoplay();
})();


//gallery section

(() => {
  const carousel = document.querySelector("#facilitiesCarousel");
  const section = document.querySelector(".facilities-section");
  if (!carousel || !section) return;

  const stage = carousel.querySelector(".facilities-stage");
  const cards = [...stage.querySelectorAll(".facility-card")];
  const prevBtn = carousel.querySelector(".facilities-prev");
  const nextBtn = carousel.querySelector(".facilities-next");
  const lightbox = section.querySelector("#facilityLightbox");
  const image = lightbox?.querySelector("#facilityLightboxImage");
  const title = lightbox?.querySelector("#facilityPopupTitle");
  const category = lightbox?.querySelector("#facilityPopupCategory");
  const description = lightbox?.querySelector("#facilityPopupDescription");
  const count = lightbox?.querySelector("#facilityPopupCount");
  const closeBtn = lightbox?.querySelector(".facility-lightbox-close");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!stage || cards.length < 2) return;

  let index = 0, activeCard = null, hovered = false, timer = null;
  let previousOverflow = "";

  const update = () => {
    cards.forEach((card, i) => {
      const slot = (i - index + cards.length) % cards.length;
      card.dataset.slot = slot;
      card.classList.toggle("is-hidden", slot > 6);
    });
  };

  const pause = () => {
    clearInterval(timer);
    timer = null;
  };

  const start = () => {
    pause();
    if (document.hidden || reducedMotion.matches || hovered || lightbox?.classList.contains("active")) return;
    timer = setInterval(() => {
      index = (index + 1) % cards.length;
      update();
    }, 1800);
  };

  const move = direction => {
    index = (index + direction + cards.length) % cards.length;
    update();
    start();
  };

  const activate = card => {
    if (card.classList.contains("is-hidden")) return;
    activeCard?.classList.remove("is-active");
    activeCard = card;
    hovered = true;
    stage.classList.add("is-hovering");
    card.classList.add("is-active");
    pause();
  };

  const deactivate = () => {
    activeCard?.classList.remove("is-active");
    activeCard = null;
    hovered = false;
    stage.classList.remove("is-hovering");
    start();
  };

  const open = card => {
    const img = card.querySelector("img");
    const caption = card.querySelector("figcaption");
    if (!lightbox || !img || !caption) return;

    const i = cards.indexOf(card) + 1;
    image.src = img.currentSrc || img.src;
    image.alt = img.alt || caption.textContent.trim();
    if (title) title.textContent = caption.textContent.trim();
    if (category) category.textContent = card.dataset.category || "CAMPUS FACILITY";
    if (description) description.textContent = card.dataset.description || "";
    if (count) count.textContent = `${String(i).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;

    previousOverflow = document.body.style.overflow;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    pause();
    closeBtn?.focus();
  };

  const close = () => {
    if (!lightbox?.classList.contains("active")) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousOverflow;
    start();
  };

  prevBtn?.addEventListener("click", () => move(-1));
  nextBtn?.addEventListener("click", () => move(1));

  cards.forEach(card => card.addEventListener("mouseenter", () => activate(card)));

  stage.addEventListener("mouseleave", deactivate);

  stage.addEventListener("click", event => {
    const card = event.target.closest(".facility-card");
    if (card && stage.contains(card) && !card.classList.contains("is-hidden")) open(card);
  });

  closeBtn?.addEventListener("click", close);

  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });

  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", start);

  update();
  start();
})();


// videos section


(() => {
  const orbit=document.querySelector("#storiesOrbit");
  const marquee=document.querySelector("#storiesMarquee");
  const modal=document.querySelector("#storyModal");
  const playerBox=document.querySelector("#storyModalPlayer");
  if(!orbit||!marquee||!modal||!playerBox)return;

  const topStories=[
    {title:"Brand Film ",id:"EjJlNHOXIXk"},
    {title:"World Health Summit Regional Meeting 2025 ",id:"BNAbDpv-BIU"},
    {title:"Walkthrough Marik Labs",id:"T2zYEz2om-Q"},
    {title:"Petr Fiala's Visit to NIMS University ",id:"WYsxFymT-2s"},
    {title:"NIMS University FPV Campus Tour ",id:"vjZlcB_w2-Q"}
  ];

  const bottomStories=[
    {title:"AI ML Advertisement",id:"xgq50_i9k7c"},
    {title:"USP",id:"y3y4T-xdFBA"},
    {title:"Student Story 1",id:"gd4OBNkfU3o"},
    {title:"Student Story 2",id:"cqEIpuYNv7c"},
    {title:"Student Story 3",id:"vAHY7T9uGWU"},
    {title:"Testimonial ",id:"eZ-GRDRQ-0Q"},
    {title:"Testimonial 2",id:"RFWfcduoPSc"},
    {title:"Global HR Industry Summit",id:"zbTpDJ9KehA"},
    {title:"Marik Visit Testimonial",id:"mj0b_P6dXG8"},
    {title:"Placement Day Celebration",id:"WezAB606iWI"},
    {title:"Brand Video",id:"z_bOyIGb-Sw"},
    {title:"Hostel Facilities",id:"S-eyw3BJNUA"},
  ];

  let current=0,timer,startX=0,animating=false;
  const cards=[];

  const embed=id=>`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

  function setThumbnail(img,id){
    const qualities=["maxresdefault","sddefault","hqdefault"];
    let quality=0;
    img.onerror=()=>{
      quality++;
      if(quality<qualities.length)img.src=`https://img.youtube.com/vi/${id}/${qualities[quality]}.jpg`;
    };
    img.src=`https://img.youtube.com/vi/${id}/${qualities[quality]}.jpg`;
  }

  function createPlayer(story){
    const iframe=document.createElement("iframe");
    iframe.src=embed(story.id);
    iframe.title=story.title;
    iframe.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen=true;
    return iframe;
  }

  function openPopup(story){
    clearInterval(timer);
    playerBox.replaceChildren(createPlayer(story));
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("story-modal-open");
    modal.querySelector(".story-modal-close")?.focus();
  }

  function closePopup(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("story-modal-open");
    playerBox.replaceChildren();
    startSlider();
  }

  function updateCard(card,index,offset,animate=true){
    const story=topStories[(index+topStories.length)%topStories.length];
    card.dataset.story=(index+topStories.length)%topStories.length;
    card.dataset.position=offset===0?"center":offset<0?"left":"right";
    card.style.setProperty("--offset",`${offset}%`);
    card.style.zIndex=offset===0?3:1;
    card.style.transition=animate?"transform .9s cubic-bezier(.22,.61,.36,1)":"none";

    if(card.dataset.id!==story.id){
      card.dataset.id=story.id;
      const img=card.querySelector("img");
      setThumbnail(img,story.id);
      img.alt=story.title;
    }
  }

  function playInline(card){
    const story=topStories[Number(card.dataset.story)];
    clearInterval(timer);
    card.classList.add("is-playing");
    card.replaceChildren(createPlayer(story));
  }

  function makeCard(){
    const card=document.createElement("div");
    card.className="story-orbit-card";
    const img=document.createElement("img");
    const play=document.createElement("button");
    play.type="button";
    play.className="story-play-icon";
    play.setAttribute("aria-label","Play video");
    card.append(img,play);
    orbit.appendChild(card);

    card.addEventListener("click",()=>{
      if(card.classList.contains("is-playing")||animating)return;
      if(card.dataset.position==="center")playInline(card);
      else{
        current=Number(card.dataset.story);
        resetCards();
      }
    });
    return card;
  }

  function renderInitial(){
    for(let i=0;i<3;i++)cards.push(makeCard());
    cards.forEach((card,i)=>updateCard(card,current+i-1,(i-1)*110,false));
  }

  function resetCards(){
    cards.forEach(card=>{
      card.classList.remove("is-playing");
      if(!card.querySelector("img")){
        const img=document.createElement("img");
        const play=document.createElement("button");
        play.type="button";
        play.className="story-play-icon";
        play.setAttribute("aria-label","Play video");
        card.append(img,play);
      }
    });
    cards.forEach((card,i)=>updateCard(card,current+i-1,(i-1)*110,false));
    startSlider();
  }

  function nextSlide(){
  if(animating||document.hidden||orbit.querySelector(".is-playing")||modal.classList.contains("is-open"))return;

  animating=true;

  cards.forEach(card=>{
    card.style.transition="transform .9s cubic-bezier(.22,.61,.36,1)";
  });

  requestAnimationFrame(()=>{
    cards.forEach((card,i)=>{
      card.style.setProperty("--offset",`${[-220,-110,0][i]}%`);
    });
  });

  setTimeout(()=>{
    current=(current+1)%topStories.length;

    const first=cards.shift();
    cards.push(first);

    updateCard(cards[0],current-1,-110,false);
    updateCard(cards[1],current,0,false);
    updateCard(cards[2],current+1,110,false);

    cards.forEach(card=>card.style.transition="none");

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        cards.forEach(card=>{
          card.style.transition="transform .9s cubic-bezier(.22,.61,.36,1)";
        });
        animating=false;
      });
    });
  },950);
}

  function startSlider(){
    clearInterval(timer);
    if(!document.hidden&&!orbit.querySelector(".is-playing")&&!modal.classList.contains("is-open")&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      timer=setInterval(nextSlide,4000);
    }
  }
  document.querySelector(".stories-next")?.addEventListener("click",()=>{
  clearInterval(timer);
  nextSlide();
  startSlider();
});

document.querySelector(".stories-prev")?.addEventListener("click",()=>{
  clearInterval(timer);
  if(animating)return;
  current=(current-1+topStories.length)%topStories.length;
  resetCards();
  startSlider();
});

  function renderMarquee(){
    marquee.replaceChildren();

    [...bottomStories,...bottomStories].forEach((story,index)=>{
      const card=document.createElement("button");
      card.type="button";
      card.className="story-marquee-card";
      card.setAttribute("aria-label",`Play ${story.title}`);

      if(index>=bottomStories.length){
        card.setAttribute("aria-hidden","true");
        card.tabIndex=-1;
      }

      const img=document.createElement("img");
      img.alt=index<bottomStories.length?story.title:"";
      img.loading="lazy";
      if(!story.id.startsWith("VIDEO_ID_"))setThumbnail(img,story.id);

      const play=document.createElement("span");
      play.className="story-play-icon";
      card.append(img,play);
      card.addEventListener("click",()=>openPopup(story));
      marquee.appendChild(card);
    });
  }

  modal.querySelectorAll("[data-close-story]").forEach(btn=>btn.addEventListener("click",closePopup));

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&modal.classList.contains("is-open"))closePopup();
  });

  orbit.addEventListener("touchstart",e=>{
    startX=e.changedTouches[0].clientX;
    clearInterval(timer);
  },{passive:true});

  orbit.addEventListener("touchend",e=>{
    if(orbit.querySelector(".is-playing"))return;
    const delta=e.changedTouches[0].clientX-startX;
    if(Math.abs(delta)>45&&!animating){
      current=(current+(delta<0?1:-1)+topStories.length)%topStories.length;
      resetCards();
    }
    startSlider();
  },{passive:true});

  orbit.addEventListener("mouseenter",()=>clearInterval(timer));
  orbit.addEventListener("mouseleave",startSlider);
  document.addEventListener("visibilitychange",startSlider);

  renderInitial();
  renderMarquee();
  startSlider();
})();

// leadership

(() => {
  const viewport = document.querySelector("#leadersViewport");
  const track = document.querySelector("#leadersTrack");
  if (!viewport || !track) return;

  const prev = document.querySelector("#leadersPrev");
  const next = document.querySelector("#leadersNext");
  const modal = document.querySelector("#leaderModal");
  const player = document.querySelector("#leaderModalPlayer");
  const close = modal?.querySelector(".leader-modal-close");
  const backdrop = modal?.querySelector(".leader-modal-backdrop");
  const cards = [...track.querySelectorAll(".leader-card")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!cards.length) return;

  let index = 0, timer = null, hovered = false, resizeTimer;

  const visibleCount = () => window.innerWidth <= 480 ? 1 : window.innerWidth <= 767 ? 2 : 3;
  const maxIndex = () => Math.max(0, cards.length - visibleCount());

  function update() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const width = cards[0].getBoundingClientRect().width;
    index = Math.min(index, maxIndex());
    track.style.transform = `translateX(-${index * (width + gap)}px)`;
  }

  function move(direction) {
    const max = maxIndex();
    index = direction > 0
      ? index >= max ? 0 : Math.min(index + visibleCount(), max)
      : index <= 0 ? max : Math.max(0, index - visibleCount());
    update();
    start();
  }

  function pause() {
    clearInterval(timer);
    timer = null;
  }

  function start() {
    pause();
    if (hovered || document.hidden || reducedMotion.matches || modal?.classList.contains("is-open")) return;
    timer = setInterval(() => move(1), 2500);
  }

  function openVideo(url) {
    if (!url || !modal || !player) return;

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.title = "Industry leader video";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;

    player.replaceChildren(iframe);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("leader-modal-open");
    pause();
    close?.focus();
  }

  function closeVideo() {
    if (!modal?.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    player?.replaceChildren();
    document.body.classList.remove("leader-modal-open");
    start();
  }

  next?.addEventListener("click", () => move(1));
  prev?.addEventListener("click", () => move(-1));

  viewport.addEventListener("mouseenter", () => {
    hovered = true;
    pause();
  });

  viewport.addEventListener("mouseleave", () => {
    hovered = false;
    start();
  });

  track.addEventListener("click", event => {
    const button = event.target.closest(".leader-play");
    if (button && track.contains(button)) openVideo(button.dataset.video);
  });

  close?.addEventListener("click", closeVideo);
  backdrop?.addEventListener("click", closeVideo);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeVideo();
  });

  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", start);

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 150);
  }, { passive: true });

  update();
  start();
})();

// placement path internships

(() => {
  const viewport = document.querySelector("#placementPathViewport");
  const track = document.querySelector("#placementPathTrack");
  const prev = document.querySelector("#placementPathPrev");
  const next = document.querySelector("#placementPathNext");

  if (!viewport || !track || !prev || !next) return;

  const cards = [...track.querySelectorAll(".placement-path-card")];

if (!cards.length) return;

cards.forEach((card, index) => {
  card.setAttribute("role", "group");
  card.setAttribute("aria-roledescription", "slide");
  card.setAttribute(
    "aria-label",
    `Slide ${index + 1} of ${cards.length}`
  );
});

if (cards.length < 2) return;

  let index = 0;
  let timer = null;
  let hovering = false;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function visibleCount() {
    return window.innerWidth <= 767 ? 1 : 2;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function updateSlider() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const step = cardWidth + gap;

    index = Math.min(index, maxIndex());

    track.style.transform = `translateX(-${index * step}px)`;

    prev.disabled = index === 0;
    next.disabled = index >= maxIndex();
  }

  function advance() {
    const step = visibleCount();
    index = index >= maxIndex() ? 0 : Math.min(index + step, maxIndex());
    updateSlider();
  }

  function startAutoSlide() {
  clearInterval(timer);
  timer = null;

  if (reducedMotion.matches || document.hidden || hovering) return;

  timer = setInterval(advance, 3000);
}

reducedMotion.addEventListener("change", startAutoSlide);

  next.addEventListener("click", () => {
    index = index >= maxIndex()
      ? 0
      : Math.min(index + visibleCount(), maxIndex());

    updateSlider();
    startAutoSlide();
  });

  prev.addEventListener("click", () => {
    index = index <= 0
      ? maxIndex()
      : Math.max(index - visibleCount(), 0);

    updateSlider();
    startAutoSlide();
  });

  viewport.addEventListener("mouseenter", () => {
    hovering = true;
  });

  viewport.addEventListener("mouseleave", () => {
    hovering = false;
  });

  viewport.addEventListener("touchstart", () => {
    hovering = true;
  }, { passive: true });

  viewport.addEventListener("touchend", () => {
    hovering = false;
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      startAutoSlide();
    }
  });

  window.addEventListener("resize", updateSlider);

  updateSlider();
  startAutoSlide();
})();

// faculty section


(() => {
  function initFaculty() {
    const section = document.querySelector(".faculty-section");
    if (!section) return;

    const row = section.querySelector(".faculty-row");
    const modal = document.querySelector("#facultyModal");
    const modalBody = document.querySelector("#facultyModalBody");

    const prevBtn = section.querySelector(".faculty-prev");
    const nextBtn = section.querySelector(".faculty-next");

    const modalPrev = modal?.querySelector(".faculty-modal-prev");
    const modalNext = modal?.querySelector(".faculty-modal-next");
    const modalCounter = modal?.querySelector(".faculty-modal-counter");

    if (!row || !prevBtn || !nextBtn) return;

    const cards = [...row.querySelectorAll(".faculty-col")];

    const profiles = [
      ...document.querySelectorAll(
        ".faculty-profile-data .faculty-profile"
      )
    ];

    if (!cards.length || !profiles.length) return;

    const mobile = window.matchMedia("(max-width: 575px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const positionClasses = [
      "faculty-pos-1",
      "faculty-pos-2",
      "faculty-pos-3",
      "faculty-pos-4",
      "faculty-pos-5"
    ];

    let currentIndex = 0;
    let currentProfileIndex = 0;
    let sliderTimer = null;
    let isHovered = false;
    let isInViewport = false;

    const getVisibleCount = () => mobile.matches ? 1 : 5;

    // MODAL PROFILE RENDER
    function renderModalProfile(direction = "next") {
      if (!modal || !modalBody) return;

      const profile = profiles[currentProfileIndex];

      if (!profile) return;

      modalBody.classList.remove(
        "profile-slide-next",
        "profile-slide-prev"
      );

      modalBody.innerHTML = profile.innerHTML;

      void modalBody.offsetWidth;

      modalBody.classList.add(
        direction === "next"
          ? "profile-slide-next"
          : "profile-slide-prev"
      );

      if (modalCounter) {
        modalCounter.textContent =
          `${currentProfileIndex + 1} / ${profiles.length}`;
      }
    }

    // OPEN MODAL
    function openProfile(card) {
      if (!modal || !modalBody) return;

      const profileId = card.dataset.profile;
      if (!profileId) return;

      const index = profiles.findIndex(
        profile => profile.id === profileId
      );

      if (index === -1) return;

      currentProfileIndex = index;

      renderModalProfile();

      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");

      document.body.style.overflow = "hidden";

      stopSlider();
    }

    // MODAL NEXT
    function nextModalProfile() {
      currentProfileIndex =
        (currentProfileIndex + 1) % profiles.length;

      renderModalProfile("next");
    }

    // MODAL PREVIOUS
    function previousModalProfile() {
      currentProfileIndex =
        (currentProfileIndex - 1 + profiles.length) % profiles.length;

      renderModalProfile("prev");
    }

    // CLOSE MODAL
    function closeProfile() {
      if (!modal || !modalBody) return;

      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");

      modalBody.innerHTML = "";

      document.body.style.overflow = "";

      startSlider();
    }

    // MODAL EVENTS
    if (modal) {
      modal.querySelector(".faculty-modal-close")
        ?.addEventListener("click", closeProfile);

      modal.querySelector(".faculty-modal-overlay")
        ?.addEventListener("click", closeProfile);

      modalPrev?.addEventListener("click", previousModalProfile);
      modalNext?.addEventListener("click", nextModalProfile);

      document.addEventListener("keydown", e => {
        if (!modal.classList.contains("active")) return;

        if (e.key === "Escape") closeProfile();
        if (e.key === "ArrowRight") nextModalProfile();
        if (e.key === "ArrowLeft") previousModalProfile();
      });
    }

    // OPEN PROFILE ON CARD CLICK
    section.addEventListener("click", e => {
      const card = e.target.closest(".faculty-card");

      if (card) openProfile(card);
    });

    // MAIN FACULTY SLIDER
    function renderFaculty() {
      const visibleCount = getVisibleCount();

      cards.forEach((card, index) => {
        const visible =
          index >= currentIndex &&
          index < currentIndex + visibleCount;

        card.classList.toggle("is-visible", visible);

        card.classList.remove(...positionClasses);

        if (visible && !mobile.matches) {
          const position = index - currentIndex;

          if (positionClasses[position]) {
            card.classList.add(positionClasses[position]);
          }
        }
      });
    }

    function nextFaculty() {
      const visibleCount = getVisibleCount();

      currentIndex =
        currentIndex + visibleCount < cards.length
          ? currentIndex + visibleCount
          : 0;

      renderFaculty();
    }

    function previousFaculty() {
      const visibleCount = getVisibleCount();

      currentIndex =
        currentIndex >= visibleCount
          ? currentIndex - visibleCount
          : Math.floor((cards.length - 1) / visibleCount) * visibleCount;

      renderFaculty();
    }

    // AUTOPLAY
    function stopSlider() {
      clearInterval(sliderTimer);
      sliderTimer = null;
    }

    function startSlider() {
      stopSlider();

      if (
        !isInViewport ||
        isHovered ||
        document.hidden ||
        motion.matches ||
        modal?.classList.contains("active") ||
        cards.length <= getVisibleCount()
      ) return;

      sliderTimer = setInterval(
        nextFaculty,
        mobile.matches ? 3000 : 4500
      );
    }

    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        isHovered = true;
        stopSlider();
      });

      card.addEventListener("mouseleave", () => {
        isHovered = false;
        startSlider();
      });
    });

    nextBtn.addEventListener("click", () => {
      nextFaculty();
      startSlider();
    });

    prevBtn.addEventListener("click", () => {
      previousFaculty();
      startSlider();
    });

    // VIEWPORT OBSERVER
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isInViewport = entry.isIntersecting;

        if (isInViewport) {
          startSlider();
        } else {
          stopSlider();
        }
      });
    }, {
      threshold: 0.15
    });

    observer.observe(section);

    // RESPONSIVE RESET
    function resetSlider() {
      currentIndex = 0;
      renderFaculty();
      startSlider();
    }

    mobile.addEventListener("change", resetSlider);
    motion.addEventListener("change", startSlider);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopSlider();
      } else {
        startSlider();
      }
    });

    renderFaculty();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFaculty);
  } else {
    initFaculty();
  }
})();



// success stories

document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".success-stories-grid");
    const prev = document.querySelector(".success-prev");
    const next = document.querySelector(".success-next");

    if (!slider || !prev || !next) return;

    const cards = [...slider.querySelectorAll(".success-card")];

    if (cards.length < 2) return;

    let currentIndex = 0;
    let timer = null;
    let isHovered = false;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function getVisibleCards() {
        if (window.innerWidth <= 575) return 1;
        if (window.innerWidth <= 991) return 2;
        return 3;
    }

    function showGroup(index) {
        const visible = getVisibleCards();
        const maxIndex = Math.max(0, cards.length - visible);

        currentIndex = Math.max(0, Math.min(index, maxIndex));

        const gap = parseFloat(getComputedStyle(slider).gap) || 0;
        const step = cards[0].offsetWidth + gap;

        slider.scrollTo({
            left: currentIndex * step,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
    }

    function moveNext() {
        const visible = getVisibleCards();
        const maxIndex = Math.max(0, cards.length - visible);

        showGroup(currentIndex >= maxIndex ? 0 : Math.min(currentIndex + visible, maxIndex));
    }

    function movePrev() {
        const visible = getVisibleCards();
        const maxIndex = Math.max(0, cards.length - visible);

        showGroup(currentIndex <= 0 ? maxIndex : Math.max(0, currentIndex - visible));
    }

    function pauseAutoplay() {
        clearInterval(timer);
        timer = null;
    }

    function startAutoplay() {
    pauseAutoplay();

    if (reducedMotion.matches || isHovered || document.hidden) return;

    timer = setInterval(moveNext, 2500);
}

reducedMotion.addEventListener("change", startAutoplay);

    slider.addEventListener("mouseenter", function () {
        isHovered = true;
        pauseAutoplay();
    });

    slider.addEventListener("mouseleave", function () {
        isHovered = false;
        startAutoplay();
    });

    next.addEventListener("click", function () {
        moveNext();
        startAutoplay();
    });

    prev.addEventListener("click", function () {
        movePrev();
        startAutoplay();
    });

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            pauseAutoplay();
        } else {
            startAutoplay();
        }
    });

    window.addEventListener("resize", function () {
        showGroup(currentIndex);
    });

    showGroup(0);
    startAutoplay();
});


// classroom
(() => {
    const track = document.querySelector("#classroomTrack");
    if (!track) return;

    const prev = document.querySelector(".classroom-prev");
    const next = document.querySelector(".classroom-next");
    const originalSlides = [...track.children];

    if (originalSlides.length < 2) return;

    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");

    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    let index = 1;
    let timer;
    let isAnimating = false;
    const interval = 4000;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateSlider(animate = true) {
        track.style.transition = animate ? "transform .7s cubic-bezier(.22,.61,.36,1)" : "none";
        track.style.transform = `translate3d(-${index * 100}%,0,0)`;
    }

    function moveSlide(direction) {
        if (isAnimating) return;

        isAnimating = true;
        index += direction;
        updateSlider(true);
    }

    track.addEventListener("transitionend", () => {
        if (index === originalSlides.length + 1) {
            index = 1;
            updateSlider(false);
        } else if (index === 0) {
            index = originalSlides.length;
            updateSlider(false);
        }

        isAnimating = false;
    });

    next.addEventListener("click", () => {
        moveSlide(1);
        restartAutoSlide();
    });

    prev.addEventListener("click", () => {
        moveSlide(-1);
        restartAutoSlide();
    });

    function startAutoSlide() {
    clearInterval(timer);
    timer = null;

    if (reducedMotion.matches || document.hidden) return;

    timer = setInterval(() => moveSlide(1), interval);
}

reducedMotion.addEventListener("change", startAutoSlide);

    function restartAutoSlide() {
        startAutoSlide();
    }

    const slider = document.querySelector(".classroom-slider");

    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", startAutoSlide);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) clearInterval(timer);
        else startAutoSlide();
    });

    updateSlider(false);
    startAutoSlide();
})();

// counter
document.addEventListener("DOMContentLoaded", function () {
    const counters = document.querySelectorAll(".placement-stats .counter");
    const section = document.querySelector(".placement-stats");

    if (!section || !counters.length) return;

    let started = false;

    function animateCounter(counter) {
        const target = Number(counter.dataset.target);
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * target);

            counter.textContent = currentValue.toLocaleString("en-IN");

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString("en-IN");
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;

                counters.forEach(function (counter) {
                    animateCounter(counter);
                });

                observer.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(section);
});

document.addEventListener("DOMContentLoaded", function () {
    const counters = document.querySelectorAll(".package-counter");
    const section = document.querySelector(".package-card")?.parentElement;

    if (!section || !counters.length) return;

    let started = false;

    function animateCounter(counter) {
        const target = Number(counter.dataset.target);
        const prefix = counter.dataset.prefix || "";
        const suffix = counter.dataset.suffix || "";
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = (easedProgress * target).toFixed(0);

            counter.textContent = prefix + currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = prefix + target + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;

                counters.forEach(function (counter) {
                    animateCounter(counter);
                });

                observer.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(section);
});
document.addEventListener("DOMContentLoaded", function () {
    const counters = document.querySelectorAll(".research-counter");
    const section = document.querySelector(".research-stats-row");

    if (!section || !counters.length) return;

    let started = false;

    function animateCounter(counter) {
        const target = Number(counter.dataset.target);
        const suffix = counter.dataset.suffix || "";
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * target);

            counter.textContent =
                currentValue.toLocaleString("en-IN") + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent =
                    target.toLocaleString("en-IN") + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;

                counters.forEach(function (counter) {
                    animateCounter(counter);
                });

                observer.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(section);
});

// sticky bottom

(() => {
  const stickyBar = document.querySelector("#stickyAdmissionBar");
  const header = document.querySelector(".site-header");

  const hideSections = [
    ".admission-open-section",
    ".campus-showcase",
    ".nims-footer"
  ];

  if (!stickyBar || !header) return;

  let headerPassed = false;
  let shouldHide = false;
  let footerReached = false;

  function updateStickyBar() {
    const atPageBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 5;

    stickyBar.classList.toggle(
      "is-visible",
      headerPassed && !shouldHide && !footerReached && !atPageBottom
    );
  }

  const headerObserver = new IntersectionObserver(([entry]) => {
    headerPassed = !entry.isIntersecting;
    updateStickyBar();
  }, { threshold: 0 });

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.matches(".nims-footer")) {
        footerReached = entry.isIntersecting;
      }

      if (entry.target.matches(".admission-open-section, .campus-showcase")) {
        entry.target.dataset.reached = entry.isIntersecting;
      }
    });

    shouldHide = hideSections.some(selector => {
      const section = document.querySelector(selector);
      return section && section.dataset.reached === "true";
    });

    updateStickyBar();
  }, { threshold: 0 });

  headerObserver.observe(header);

  hideSections.forEach(selector => {
    const section = document.querySelector(selector);
    if (section) sectionObserver.observe(section);
  });

  window.addEventListener("scroll", updateStickyBar, { passive: true });
  window.addEventListener("resize", updateStickyBar);

  updateStickyBar();
})();



/* Accessible modal focus management */

(() => {
  const modalConfigs = [
    {
      selector: "#facilityLightbox",
      dialog: ".facility-popup",
      close: ".facility-lightbox-close",
      openClass: "active",
      label: "Campus facility details"
    },
    {
      selector: "#facultyModal",
      dialog: ".faculty-modal-content",
      close: ".faculty-modal-close",
      openClass: "active",
      label: "Faculty profile"
    },
    {
      selector: "#storyModal",
      dialog: ".story-modal-dialog",
      close: ".story-modal-close",
      openClass: "is-open",
      label: "Video story"
    },
    {
      selector: "#leaderModal",
      dialog: ".leader-modal-content",
      close: ".leader-modal-close",
      openClass: "is-open",
      label: "Industry leader video"
    }
  ];

  const modals = modalConfigs
    .map(config => ({
      ...config,
      element: document.querySelector(config.selector)
    }))
    .filter(config => config.element);

  if (!modals.length) return;

  let activeModal = null;
  let previousFocus = null;

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "iframe"
  ].join(",");

  function isOpen(config) {
    return config.element.classList.contains(config.openClass);
  }

  function getFocusable(dialog) {
    return [...dialog.querySelectorAll(focusableSelector)]
      .filter(element =>
        element.getClientRects().length &&
        element.getAttribute("aria-hidden") !== "true"
      );
  }

  function syncModal() {
    const opened = modals.find(isOpen);

    if (opened === activeModal) return;

    if (activeModal) {
      activeModal.element.setAttribute("aria-hidden", "true");

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }

      activeModal = null;
      previousFocus = null;
    }

    if (!opened) return;

    activeModal = opened;
    previousFocus = document.activeElement;

    const dialog = opened.element.querySelector(opened.dialog);

    if (!dialog) return;

    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", opened.label);

    opened.element.setAttribute("aria-hidden", "false");

    const closeButton = dialog.querySelector(opened.close);
    const focusable = getFocusable(dialog);

    requestAnimationFrame(() => {
      (closeButton || focusable[0] || dialog).focus();
    });
  }

  document.addEventListener("keydown", event => {
    if (!activeModal) return;

    const dialog = activeModal.element.querySelector(activeModal.dialog);

    if (!dialog || event.key !== "Tab") return;

    const focusable = getFocusable(dialog);

    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  });

  const observer = new MutationObserver(syncModal);

  modals.forEach(config => {
    observer.observe(config.element, {
      attributes: true,
      attributeFilter: ["class"]
    });
  });

  syncModal();
})();