/* Header-only customization on top of the GitHub application. */
(() => {
  const originalHead=head;
  const codes={ko:'KO',ja:'JA',zh:'ZH-CN','zh-TW':'ZH-TW',en:'EN'};
  const globe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';
  const arrow='<svg class="language-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  const dropdown=()=>`<details class="header-language"><summary aria-label="언어 선택 / Language">${globe}<span>${codes[state.language]||'KO'}</span>${arrow}</summary><div class="header-language-menu" role="group" aria-label="Language"><p>Language</p>${languageOptions.map(option=>`<button type="button" data-header-language="${option.code}" lang="${option.code}" aria-pressed="${state.language===option.code}"><span>${option.native}</span><small>${codes[option.code]}</small><span class="language-selected" aria-hidden="true">${state.language===option.code?'✓':''}</span></button>`).join('')}</div></details>`;
  head=(...args)=>['stores','pass','saved','profile'].includes(state.screen)?'':originalHead(...args).replace(/<button class="iconbtn" data-nav="profile" aria-label="마이">[\s\S]*?<\/button>/,dropdown());
  const originalSwitch=switchCampaign;
  switchCampaign=(...args)=>{
    if(document.querySelector('.header-language[open]')){restartBannerRotation();return;}
    return originalSwitch(...args);
  };
  const close=(focus=false)=>{
    const menu=document.querySelector('.header-language[open]');
    if(!menu)return;
    menu.removeAttribute('open');
    if(focus)menu.querySelector('summary').focus();
  };
  document.addEventListener('click',event=>{
    const choice=event.target.closest('[data-header-language]');
    if(choice){
      const language=choice.dataset.headerLanguage;
      if(!languageOptions.some(option=>option.code===language))return;
      const viewport=document.querySelector('#viewport'),scroll=viewport.scrollTop;
      state.language=language;state.pendingLanguage=language;state.languageReady=true;
      render();viewport.scrollTop=scroll;document.documentElement.lang=language;window.dispatchEvent(new Event('busan-language-changed'));
      document.querySelector('.header-language summary')?.focus();
    }else if(!event.target.closest('.header-language'))close();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close(true);});
  render();
})();
