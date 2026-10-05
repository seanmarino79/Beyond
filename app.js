(() => {
  'use strict';

  const STORAGE_KEY = 'aboveBeyondTherapyNoteGenerator_v4';
  const LEGACY_V3_STORAGE_KEY = 'aboveBeyondTherapyNoteGenerator_v3';
  const LEGACY_V2_STORAGE_KEY = 'aboveBeyondTherapyNoteGenerator_v2';
  const LEGACY_STORAGE_KEY = 'aboveBeyondTherapyNoteGenerator_v1';
  const VARIANT_COUNT = 6;

  const state = loadState();
  let selectedChildId = state.lastSelectedChildId || null;
  let editingSessionId = null;
  let toastTimer = null;
  let noteVariantIndex = 0;
  let skillToyAssignments = {};
  let skillPerformanceAssignments = {};
  let signatureStrokes = { therapist: [], parent: [] };
  const activeSignaturePointers = new Map();

  const groups = {
    temperament: ['Angry', 'Excited', 'Happy', 'Shy', 'Sleepy', 'Upset'],
    engagement: ['Active', 'Engaged', 'Not Engaged', 'Self-Directed'],
    toy: ['Engaged', 'Kicking', 'Quick Changing', 'Scattering', 'Throwing'],
    socialInteraction: ['Joint Eye Contact', 'Reciprocal Play', 'Social Smiles'],
    selfConcept: ['Knows Age', 'Knows Gender', 'Knows Name'],
    fineMotor: ['Bilateral Play', 'Block Stacking and Design', 'Imitation of Strokes', 'Pincer Grasp', 'Puzzles', 'Reaching', 'Supported Sitting', 'Supported Standing', 'Tummy Time'],
    receptive: [
      'Cause and Effect',
      'Following One-Step Directions',
      'Following Two-Step Directions',
      'Identification of Action Words',
      'Identification of Body Parts',
      'Identification of Functions of Objects',
      'Identification of Objects',
      'Identification of Pictures',
      'Matching and Sorting Activities',
      'Problem Solving Activities',
      'Size Concepts',
      'Understanding Prepositions',
      'Visual Tracking',
      'WH Questions'
    ],
    socialSkills: [
            'Imitating Actions',
      'Imitating Sounds',
      'Increasing Attention',
      'Make-Believe Play',
      'Positive Reinforcement',
      'Sensory Play',
      'Structured Tasks',
      'Turn Taking'
    ],
    expressive: ['Auditory Response', 'Give Choices', 'Imitation', 'Labeling', 'Modeling', 'Use of Pictures', 'Use of Signs'],
    prepositions: [
      'Above', 'Around', 'Behind', 'Below', 'Beside / Next To', 'Between', 'Down', 'In', 'In Front Of',
      'Inside', 'Near', 'Off', 'On', 'Out Of', 'Outside', 'Over', 'Through', 'Under', 'Up'
    ],
    whQuestions: ['How', 'What', 'When', 'Where', 'Which', 'Who', 'Why']
  };

  const toyAssignableGroups = ['socialInteraction', 'selfConcept', 'handOverHand', 'fineMotor', 'receptive', 'socialSkills', 'expressive'];
  const skillGroupLabels = {
    socialInteraction: 'Social Interaction',
    selfConcept: 'Self Concept',
    handOverHand: 'Hand-Over-Hand Assistance',
    fineMotor: 'Motor',
    receptive: 'Receptive / Cognitive',
    socialSkills: 'Social Skills',
    expressive: 'Language'
  };

  const phraseMap = {
    'Joint Eye Contact': 'joint eye contact',
    'Reciprocal Play': 'reciprocal play',
    'Social Smiles': 'social smiles',
    'Knows Age': 'identifying own age',
    'Knows Gender': 'identifying own gender',
    'Knows Name': 'identifying own name',
    'Identification of Items': 'identification of items',
    'Manipulation of Tactile Objects': 'manipulation of tactile objects',
    'Bilateral Play': 'bilateral play',
    'Block Stacking and Design': 'block stacking and design',
    'Imitation of Strokes': 'imitation of strokes',
    'Pincer Grasp': 'pincer grasp',
    'Puzzles': 'puzzle completion',
    'Reaching': 'reaching',
    'Supported Sitting': 'supported sitting',
    'Supported Standing': 'supported standing',
    'Tummy Time': 'tummy time',
    'Cause and Effect': 'cause-and-effect skills',
    'Following One-Step Directions': 'following one-step directions',
    'Following Two-Step Directions': 'following two-step directions',
    'Identification of Action Words': 'identification of action words',
    'Identification of Body Parts': 'identification of body parts',
    'Identification of Functions of Objects': 'identification of object functions',
    'Identification of Objects': 'identification of objects',
    'Identification of Pictures': 'identification of pictures',
    'Matching and Sorting Activities': 'matching and sorting activities',
    'Problem Solving Activities': 'problem-solving activities',
    'Size Concepts': 'size concepts',
    'Understanding Prepositions': 'understanding prepositions',
    'Visual Tracking': 'visual tracking',
    'WH Questions': 'WH questions',
    'Answering Self-Concept Skills': 'answering self-concept questions',
    'Imitating Actions': 'imitating actions',
    'Imitating Sounds': 'imitating sounds',
    'Increasing Attention': 'increasing attention',
    'Make-Believe Play': 'make-believe play',
    'Positive Reinforcement': 'positive reinforcement',
    'Sensory Play': 'sensory play',
    'Structured Tasks': 'structured tasks',
    'Turn Taking': 'turn taking',
    'Auditory Response': 'auditory response',
    'Give Choices': 'providing choices',
    'Imitation': 'imitation',
    'Labeling': 'labeling',
    'Modeling': 'modeling',
    'Use of Pictures': 'use of pictures',
    'Use of Signs': 'use of signs'
  };

  const behaviorMap = {
    'Engaged': 'engaged appropriately with toys',
    'Kicking': 'kicking',
    'Quick Changing': 'quickly changing between toys or activities',
    'Scattering': 'scattering toys or materials',
    'Throwing': 'throwing toys or materials'
  };

  const engagementMap = {
    'Active': 'active',
    'Engaged': 'engaged',
    'Not Engaged': 'not consistently engaged',
    'Self-Directed': 'self-directed'
  };

  const els = {};
  const byId = id => document.getElementById(id);

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    Object.assign(els, {
      childList: byId('childList'), childSearch: byId('childSearch'), sessionHistory: byId('sessionHistory'),
      childName: byId('childName'), childGender: byId('childGender'), dateOfService: byId('dateOfService'), timeIn: byId('timeIn'), timeOut: byId('timeOut'),
      nextAppointment: byId('nextAppointment'), location: byId('location'), whoPresent: byId('whoPresent'), therapistName: byId('therapistName'),
      narrative: byId('narrative'), clinicianNotes: byId('clinicianNotes'), generatedNote: byId('generatedNote'),
      saveStatus: byId('saveStatus'), toast: byId('toast'), childDialog: byId('childDialog'), newChildName: byId('newChildName'), newChildGender: byId('newChildGender'),
      toyAssignmentList: byId('toyAssignmentList'), bulkToyInput: byId('bulkToyInput'), variantLabel: byId('variantLabel'),
      coTreatWith: byId('coTreatWith'), otherPrepositions: byId('otherPrepositions'), otherWhQuestions: byId('otherWhQuestions')
    });

    renderGroup('temperamentOptions', 'temperament', groups.temperament);
    renderGroup('engagementOptions', 'engagement', groups.engagement);
    renderGroup('toyOptions', 'toy', groups.toy);
    renderGroup('socialInteractionOptions', 'socialInteraction', groups.socialInteraction);
    renderGroup('selfConceptOptions', 'selfConcept', groups.selfConcept);
    renderGroup('fineMotorOptions', 'fineMotor', groups.fineMotor);
    renderGroup('receptiveOptions', 'receptive', groups.receptive);
    renderGroup('socialSkillsOptions', 'socialSkills', groups.socialSkills);
    renderGroup('expressiveOptions', 'expressive', groups.expressive);
    renderGroup('prepositionOptions', 'prepositions', groups.prepositions);
    renderGroup('whQuestionOptions', 'whQuestions', groups.whQuestions);

    bindEvents();
    setupSignaturePad('therapistSignaturePad', 'therapist');
    setupSignaturePad('parentSignaturePad', 'parent');
    resetForm(false);
    els.therapistName.value = state.settings?.therapistName || '';

    if (selectedChildId && !state.clients.some(c => c.id === selectedChildId)) selectedChildId = null;
    renderChildren();
    if (selectedChildId) selectChild(selectedChildId, false);
    else renderHistory();
    renderToyAssignments();
    updateConditionalDetails();
    updateGeneratedAndPreview();
    setTimeout(redrawAllSignatureCanvases, 50);
  }

  function bindEvents() {
    byId('addChildBtn').addEventListener('click', () => {
      els.newChildName.value = '';
      if (els.newChildGender) els.newChildGender.value = '';
      els.childDialog.showModal();
      setTimeout(() => els.newChildName.focus(), 30);
    });

    byId('childDialogForm').addEventListener('submit', e => {
      e.preventDefault();
      const name = els.newChildName.value.trim();
      if (!name) return;
      const existing = state.clients.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        selectChild(existing.id);
        els.childDialog.close();
        toast('That child already exists. Selected the existing record.');
        return;
      }
      const child = { id: uid('c'), name, gender: els.newChildGender?.value || '', createdAt: new Date().toISOString() };
      state.clients.push(child);
      persist();
      renderChildren();
      selectChild(child.id);
      els.childDialog.close();
      toast('Child added.');
    });

    els.childSearch.addEventListener('input', renderChildren);
    byId('newSessionBtn').addEventListener('click', () => resetForm(true));
    byId('saveSessionBtn').addEventListener('click', saveSession);
    byId('copyNoteBtn').addEventListener('click', copyGeneratedNote);
    byId('regenerateBtn').addEventListener('click', regenerateNote);
    byId('applyToyToAllBtn').addEventListener('click', applyToyToAllSelected);
    byId('printBtn').addEventListener('click', () => {
      updateGeneratedAndPreview();
      redrawPreviewSignatures();
      window.print();
    });
    byId('downloadPdfBtn').addEventListener('click', downloadPdf);
    byId('downloadWordBtn').addEventListener('click', downloadRtf);
    byId('shareBtn').addEventListener('click', sharePdf);
    byId('exportDataBtn').addEventListener('click', exportBackup);
    byId('importDataInput').addEventListener('change', importBackup);
    byId('clearTherapistSignatureBtn').addEventListener('click', () => clearSignature('therapist'));
    byId('clearParentSignatureBtn').addEventListener('click', () => clearSignature('parent'));

    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => {
        markDirty();
        updateGeneratedAndPreview();
      });
      el.addEventListener('change', () => {
        markDirty();
        if (el.matches('input[type="checkbox"][data-group]')) renderToyAssignments();
        updateConditionalDetails(el);
        updateGeneratedAndPreview();
      });
    });

    els.therapistName.addEventListener('change', () => {
      state.settings = state.settings || {};
      state.settings.therapistName = els.therapistName.value.trim();
      persist();
    });

    window.addEventListener('resize', debounce(redrawAllSignatureCanvases, 100));
    window.addEventListener('beforeprint', redrawPreviewSignatures);
  }

  function renderGroup(containerId, groupName, options) {
    const container = byId(containerId);
    container.innerHTML = options.map(option =>
      `<label class="check-row"><input type="checkbox" data-group="${groupName}" value="${escapeHtml(option)}" /> ${escapeHtml(option)}</label>`
    ).join('');
  }

  function renderChildren() {
    const q = (els.childSearch?.value || '').trim().toLowerCase();
    const clients = [...state.clients]
      .sort((a,b) => a.name.localeCompare(b.name))
      .filter(c => c.name.toLowerCase().includes(q));
    if (!clients.length) {
      els.childList.innerHTML = `<div class="empty-state">${state.clients.length ? 'No matching children.' : 'No children yet. Click + to add one.'}</div>`;
      return;
    }
    els.childList.innerHTML = clients.map(c => `
      <div class="child-item ${c.id === selectedChildId ? 'active' : ''}" data-child-id="${c.id}">
        <button type="button" class="select-child"><span>${escapeHtml(c.name)}</span>${c.gender ? `<span class="child-gender">${escapeHtml(c.gender)}</span>` : ''}</button>
        <button type="button" class="delete-child" title="Delete child">Delete</button>
      </div>`).join('');

    els.childList.querySelectorAll('.select-child').forEach(btn => btn.addEventListener('click', e => {
      const id = e.target.closest('.child-item').dataset.childId;
      selectChild(id);
    }));
    els.childList.querySelectorAll('.delete-child').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = e.target.closest('.child-item').dataset.childId;
      deleteChild(id);
    }));
  }

  function selectChild(id, reset = true) {
    selectedChildId = id;
    state.lastSelectedChildId = id;
    persist();
    renderChildren();
    renderHistory();
    if (reset) resetForm(true);
    const child = state.clients.find(c => c.id === id);
    if (child) {
      els.childName.value = child.name;
      if (els.childGender) els.childGender.value = child.gender || '';
    }
    updateGeneratedAndPreview();
  }

  function deleteChild(id) {
    const child = state.clients.find(c => c.id === id);
    if (!child) return;
    const sessionCount = state.sessions.filter(s => s.childId === id).length;
    const message = sessionCount
      ? `Delete ${child.name} and ${sessionCount} saved session${sessionCount === 1 ? '' : 's'}? This cannot be undone.`
      : `Delete ${child.name}? This cannot be undone.`;
    if (!confirm(message)) return;
    state.clients = state.clients.filter(c => c.id !== id);
    state.sessions = state.sessions.filter(s => s.childId !== id);
    if (selectedChildId === id) selectedChildId = null;
    state.lastSelectedChildId = selectedChildId;
    persist();
    resetForm(false);
    renderChildren();
    renderHistory();
    toast('Child deleted.');
  }

  function renderHistory() {
    if (!selectedChildId) {
      els.sessionHistory.className = 'history-list empty-state';
      els.sessionHistory.textContent = 'Select a child to view saved sessions.';
      return;
    }
    const sessions = state.sessions
      .filter(s => s.childId === selectedChildId)
      .sort((a,b) => (b.dateOfService || '').localeCompare(a.dateOfService || '') || (b.savedAt || '').localeCompare(a.savedAt || ''));
    if (!sessions.length) {
      els.sessionHistory.className = 'history-list empty-state';
      els.sessionHistory.textContent = 'No saved sessions for this child yet.';
      return;
    }
    els.sessionHistory.className = 'history-list';
    els.sessionHistory.innerHTML = sessions.map(s => `
      <button type="button" class="history-item" data-session-id="${s.id}">
        <div class="date">${escapeHtml(formatDate(s.dateOfService) || 'Undated session')}</div>
        <div class="meta">${escapeHtml([s.location, formatTimeRange(s.timeIn, s.timeOut)].filter(Boolean).join(' • '))}</div>
      </button>`).join('');
    els.sessionHistory.querySelectorAll('.history-item').forEach(btn => btn.addEventListener('click', () => loadSession(btn.dataset.sessionId)));
  }

  function resetForm(keepChild) {
    editingSessionId = null;
    noteVariantIndex = 0;
    skillToyAssignments = {};
    skillPerformanceAssignments = {};
    signatureStrokes = { therapist: [], parent: [] };
    const child = keepChild && selectedChildId ? state.clients.find(c => c.id === selectedChildId) : null;
    document.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(i => i.checked = false);
    ['timeIn','timeOut','nextAppointment','location','whoPresent','narrative','clinicianNotes','bulkToyInput','coTreatWith','otherPrepositions','otherWhQuestions'].forEach(id => {
      const el = byId(id);
      if (el) el.value = '';
    });
    els.dateOfService.value = todayISO();
    els.childName.value = child ? child.name : '';
    if (els.childGender) els.childGender.value = child?.gender || '';
    els.therapistName.value = state.settings?.therapistName || els.therapistName.value || '';
    els.saveStatus.textContent = 'Not saved';
    renderToyAssignments();
    updateConditionalDetails();
    updateGeneratedAndPreview();
    setTimeout(redrawAllSignatureCanvases, 0);
  }

  function markDirty() {
    els.saveStatus.textContent = editingSessionId ? 'Unsaved changes' : 'Not saved';
  }

  function saveSession() {
    const data = collectFormData();
    if (!data.childName.trim()) {
      alert('Please select or enter a child name before saving.');
      return;
    }

    let child = selectedChildId ? state.clients.find(c => c.id === selectedChildId) : null;
    if (!child || child.name.toLowerCase() !== data.childName.trim().toLowerCase()) {
      child = state.clients.find(c => c.name.toLowerCase() === data.childName.trim().toLowerCase());
      if (!child) {
        child = { id: uid('c'), name: data.childName.trim(), gender: data.childGender || '', createdAt: new Date().toISOString() };
        state.clients.push(child);
      }
      selectedChildId = child.id;
      state.lastSelectedChildId = child.id;
    }
    child.name = data.childName.trim();
    child.gender = data.childGender || child.gender || '';

    const record = {
      ...data,
      childId: child.id,
      savedAt: new Date().toISOString(),
      generatedNote: buildFinalNarrative(data)
    };

    if (editingSessionId) {
      const index = state.sessions.findIndex(s => s.id === editingSessionId);
      if (index >= 0) state.sessions[index] = { ...state.sessions[index], ...record, id: editingSessionId };
      else {
        editingSessionId = uid('s');
        state.sessions.push({ ...record, id: editingSessionId });
      }
    } else {
      editingSessionId = uid('s');
      state.sessions.push({ ...record, id: editingSessionId });
    }

    state.settings = state.settings || {};
    state.settings.therapistName = data.therapistName.trim();
    persist();
    renderChildren();
    renderHistory();
    els.saveStatus.textContent = 'Saved';
    toast('Session saved.');
  }

  function loadSession(id) {
    const s = state.sessions.find(x => x.id === id);
    if (!s) return;
    editingSessionId = id;
    selectedChildId = s.childId;
    state.lastSelectedChildId = selectedChildId;
    applyFormData(s);
    persist();
    renderChildren();
    els.saveStatus.textContent = 'Saved';
    updateGeneratedAndPreview();
    setTimeout(redrawAllSignatureCanvases, 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function collectFormData() {
    syncSkillToyAssignmentsFromDom();
    const selectedSetting = document.querySelector('input[name="sessionSetting"]:checked');
    return {
      childName: els.childName.value,
      childGender: els.childGender?.value || '',
      dateOfService: els.dateOfService.value,
      timeIn: els.timeIn.value,
      timeOut: els.timeOut.value,
      nextAppointment: els.nextAppointment.value,
      location: els.location.value,
      whoPresent: els.whoPresent.value,
      therapistName: els.therapistName.value,
      sessionIndividual: checkedField('sessionIndividual'),
      sessionSetting: selectedSetting ? selectedSetting.value : '',
      interpreterPresent: checkedField('interpreterPresent'),
      dtBilingual: checkedField('dtBilingual'),
      coTreat: checkedField('coTreat'),
      coTreatWith: els.coTreatWith?.value.trim() || '',
      handOverHandUsed: checkedField('handOverHandUsed'),
      handOverHand: checkedGroup('handOverHand'),
      temperament: checkedGroup('temperament'),
      engagement: checkedGroup('engagement'),
      toy: checkedGroup('toy'),
      socialInteraction: checkedGroup('socialInteraction'),
      selfConcept: checkedGroup('selfConcept'),
      fineMotor: checkedGroup('fineMotor'),
      receptive: checkedGroup('receptive'),
      prepositions: checkedGroup('prepositions'),
      otherPrepositions: els.otherPrepositions?.value.trim() || '',
      whQuestions: checkedGroup('whQuestions'),
      otherWhQuestions: els.otherWhQuestions?.value.trim() || '',
      socialSkills: checkedGroup('socialSkills'),
      expressive: checkedGroup('expressive'),
      skillToys: { ...skillToyAssignments },
      skillPerformance: { ...skillPerformanceAssignments },
      narrative: els.narrative.value.trim(),
      clinicianNotes: els.clinicianNotes.value.trim(),
      noteVariant: noteVariantIndex,
      signatures: deepClone(signatureStrokes)
    };
  }

  function applyFormData(s) {
    const childProfile = state.clients.find(c => c.id === s.childId);
    els.childName.value = s.childName || childProfile?.name || '';
    if (els.childGender) els.childGender.value = s.childGender || childProfile?.gender || '';
    els.dateOfService.value = s.dateOfService || '';
    els.timeIn.value = s.timeIn || '';
    els.timeOut.value = s.timeOut || '';
    els.nextAppointment.value = s.nextAppointment || '';
    els.location.value = s.location || '';
    els.whoPresent.value = s.whoPresent || '';
    els.therapistName.value = s.therapistName || state.settings?.therapistName || '';
    setCheckedField('sessionIndividual', !!s.sessionIndividual);
    setCheckedField('interpreterPresent', !!s.interpreterPresent);
    setCheckedField('dtBilingual', !!s.dtBilingual);
    setCheckedField('coTreat', !!s.coTreat);
    if (els.coTreatWith) els.coTreatWith.value = s.coTreatWith || '';
    setCheckedField('handOverHandUsed', !!s.handOverHandUsed);
    document.querySelectorAll('input[name="sessionSetting"]').forEach(i => i.checked = i.value === (s.sessionSetting || ''));
    ['handOverHand','temperament','engagement','toy','socialInteraction','selfConcept','fineMotor','receptive','socialSkills','expressive','prepositions','whQuestions'].forEach(g => setCheckedGroup(g, s[g] || []));
    if (els.otherPrepositions) els.otherPrepositions.value = s.otherPrepositions || '';
    if (els.otherWhQuestions) els.otherWhQuestions.value = s.otherWhQuestions || '';
    updateConditionalDetails();
    els.narrative.value = [s.narrative || '', s.additionalManual || ''].filter(Boolean).join(' ').trim();
    els.clinicianNotes.value = s.clinicianNotes || '';
    noteVariantIndex = Number.isInteger(s.noteVariant) ? s.noteVariant % VARIANT_COUNT : 0;
    skillToyAssignments = { ...(s.skillToys || {}) };
    skillPerformanceAssignments = { ...(s.skillPerformance || {}) };
    signatureStrokes = normalizeSignatures(s.signatures);
    renderToyAssignments();
  }

  function renderToyAssignments() {
    syncSkillToyAssignmentsFromDom();
    const selected = getSelectedToyAssignableSkills();
    if (!selected.length) {
      els.toyAssignmentList.className = 'toy-assignment-list empty-state';
      els.toyAssignmentList.textContent = 'Select therapy skills above to assign toys or materials.';
      return;
    }

    els.toyAssignmentList.className = 'toy-assignment-list';
    els.toyAssignmentList.innerHTML = selected.map(({ group, skill }) => {
      const key = toyKey(group, skill);
      const value = skillToyAssignments[key] || '';
      const performance = skillPerformanceAssignments[key] || '';
      const performanceClass = value.trim() ? '' : ' hidden-performance';
      return `
        <div class="toy-assignment-row">
          <div class="toy-skill-label">
            <span class="toy-category">${escapeHtml(skillGroupLabels[group] || group)}</span>
            <strong>${escapeHtml(skill)}</strong>
          </div>
          <input class="text-input toy-material-input" type="text" data-toy-key="${escapeHtml(key)}" value="${escapeHtml(value)}" placeholder="Toy / material used (optional)" />
          <select class="text-input toy-performance-input${performanceClass}" data-performance-key="${escapeHtml(key)}" aria-label="How the child did with ${escapeHtml(skill)}">
            <option value="">How did they do?</option>
            <option value="Succeeded"${performance === 'Succeeded' ? ' selected' : ''}>Succeeded</option>
            <option value="Needed Support"${performance === 'Needed Support' ? ' selected' : ''}>Needed Support</option>
            <option value="Struggled"${performance === 'Struggled' ? ' selected' : ''}>Struggled</option>
          </select>
        </div>`;
    }).join('');

    els.toyAssignmentList.querySelectorAll('[data-toy-key]').forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.toyKey;
        skillToyAssignments[key] = input.value;
        const performanceSelect = els.toyAssignmentList.querySelector(`[data-performance-key="${cssEscape(key)}"]`);
        const hasToy = !!input.value.trim();
        if (performanceSelect) {
          performanceSelect.classList.toggle('hidden-performance', !hasToy);
          if (!hasToy) {
            performanceSelect.value = '';
            skillPerformanceAssignments[key] = '';
          }
        }
        markDirty();
        updateGeneratedAndPreview();
      });
    });

    els.toyAssignmentList.querySelectorAll('[data-performance-key]').forEach(select => {
      select.addEventListener('change', () => {
        skillPerformanceAssignments[select.dataset.performanceKey] = select.value;
        markDirty();
        updateGeneratedAndPreview();
      });
    });
  }

  function getSelectedToyAssignableSkills() {
    const out = [];
    toyAssignableGroups.forEach(group => {
      checkedGroup(group).forEach(skill => out.push({ group, skill }));
    });
    return out;
  }

  function syncSkillToyAssignmentsFromDom() {
    document.querySelectorAll('[data-toy-key]').forEach(input => {
      skillToyAssignments[input.dataset.toyKey] = input.value;
    });
    document.querySelectorAll('[data-performance-key]').forEach(select => {
      skillPerformanceAssignments[select.dataset.performanceKey] = select.value;
    });
  }

  function applyToyToAllSelected() {
    const toy = els.bulkToyInput.value.trim();
    if (!toy) return toast('Enter a toy or material first.');
    const selected = getSelectedToyAssignableSkills();
    if (!selected.length) return toast('Select at least one therapy skill first.');
    selected.forEach(({group, skill}) => {
      skillToyAssignments[toyKey(group, skill)] = toy;
    });
    renderToyAssignments();
    markDirty();
    updateGeneratedAndPreview();
    toast('Toy/material applied to all selected skills.');
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/(["\\])/g, '\\$1');
  }

  function toyKey(group, skill) {
    return `${group}::${skill}`;
  }

  function regenerateNote() {
    noteVariantIndex = (noteVariantIndex + 1) % VARIANT_COUNT;
    markDirty();
    updateGeneratedAndPreview();
    toast(`Narrative recreated — version ${noteVariantIndex + 1}.`);
  }

  function buildFinalNarrative(data) {
    const generated = buildGeneratedNote(data, data.noteVariant ?? noteVariantIndex);
    const manual = cleanPhrase(data.narrative || '');
    if (generated && manual) return `${generated} ${ensureSentence(manual)}`.replace(/\s+/g, ' ').trim();
    if (manual) return ensureSentence(manual);
    return generated;
  }

  function buildGeneratedNote(data, variant = 0) {
    const v = Math.abs(Number(variant) || 0) % VARIANT_COUNT;
    const sentences = [];
    const pronouns = getPronouns(data);

    const sessionType = data.sessionIndividual ? 'individual therapy session' : 'therapy session';
    const setting = describeSetting(data);
    const present = cleanPhrase(data.whoPresent || '');
    const openingTemplates = [
      `The child participated in ${articleFor(sessionType)} ${sessionType}${setting ? ` ${setting}` : ''}${present ? ` with ${present} present` : ''}.`,
      `${capitalize(articleFor(sessionType))} ${sessionType} was completed${setting ? ` ${setting}` : ''}${present ? ` with ${present} present` : ''}.`,
      `Today's ${sessionType} took place${setting ? ` ${setting}` : ''}${present ? ` with ${present} present` : ''}.`,
      `The child was seen for ${articleFor(sessionType)} ${sessionType}${setting ? ` ${setting}` : ''}${present ? ` while ${present} was present` : ''}.`,
      `During ${articleFor(sessionType)} ${sessionType}${setting ? ` ${setting}` : ''}, the child participated in planned therapeutic activities${present ? ` with ${present} present` : ''}.`,
      `${capitalize(articleFor(sessionType))} ${sessionType} occurred${setting ? ` ${setting}` : ''}${present ? ` in the presence of ${present}` : ''}.`
    ];
    sentences.push(openingTemplates[v]);

    const support = [];
    if (data.interpreterPresent) support.push('an interpreter was present');
    if (data.dtBilingual) support.push('bilingual DT support was provided');
    if (data.coTreat) {
      const withWho = cleanPhrase(data.coTreatWith || '');
      support.push(withWho ? `co-treatment was provided with ${withWho}` : 'co-treatment was provided');
    }
    if (support.length) {
      const supportText = joinHuman(support);
      const supportTemplates = [
        `${capitalize(supportText)}.`,
        `Session supports were documented as follows: ${supportText}.`,
        `Additional session supports were documented as follows: ${supportText}.`,
        `During the visit, ${supportText}.`,
        `The session also included the following supports: ${supportText}.`,
        `Support during the session was documented as follows: ${supportText}.`
      ];
      sentences.push(supportTemplates[v]);
    }

    const presentation = buildPresentationSentence(data, v);
    if (presentation) sentences.push(presentation);

    const categorySentences = buildCategorySentences(data, v);
    sentences.push(...categorySentences);

    if (data.handOverHandUsed || (data.handOverHand || []).length) {
      const items = data.handOverHand || [];
      const desc = items.length ? describeSkillsWithToys('handOverHand', items, data, v) : '';
      const hohTemplates = [
        desc ? `Hand-over-hand assistance was used to support ${desc}.` : 'Hand-over-hand assistance was used as needed during the session.',
        desc ? `The therapist provided hand-over-hand assistance during ${desc}.` : 'The therapist provided hand-over-hand assistance as needed.',
        desc ? `Hand-over-hand support was incorporated for ${desc}.` : 'Hand-over-hand support was incorporated when needed.',
        desc ? `Physical guidance through hand-over-hand assistance supported ${desc}.` : 'Physical guidance through hand-over-hand assistance was provided when needed.',
        desc ? `Hand-over-hand prompting was used while working on ${desc}.` : 'Hand-over-hand prompting was used as appropriate.',
        desc ? `${pronouns.subjectCap} received hand-over-hand support for ${desc}.` : `${pronouns.subjectCap} received hand-over-hand support as needed.`
      ];
      sentences.push(hohTemplates[v]);
    }

    const clinician = buildClinicianNoteSentence(data.clinicianNotes, v, data);
    if (clinician) sentences.push(clinician);

    const skillAreas = [];
    if ((data.socialInteraction || []).length) skillAreas.push('social interaction');
    if ((data.selfConcept || []).length) skillAreas.push('self-concept skills');
    if ((data.fineMotor || []).length) skillAreas.push('motor skills');
    if ((data.receptive || []).length) skillAreas.push('receptive communication and cognitive skills');
    if ((data.socialSkills || []).length) skillAreas.push('social skills');
    if ((data.expressive || []).length) skillAreas.push('language skills');
    if (skillAreas.length) {
      const practiceTemplates = [
        `Continued opportunities to practice ${joinHuman(skillAreas)} are recommended during familiar routines and play activities.`,
        `Home and daily routines can continue to provide practice opportunities for ${joinHuman(skillAreas)}.`,
        `Ongoing practice of ${joinHuman(skillAreas)} is encouraged across familiar play and everyday routines.`,
        `Caregivers can continue supporting ${pronouns.object} with ${joinHuman(skillAreas)} through naturally occurring routines and play.`,
        `The skills addressed today can continue to be practiced during familiar routines, with emphasis on ${joinHuman(skillAreas)}.`,
        `Continued carryover of ${joinHuman(skillAreas)} is encouraged during everyday activities and play.`
      ];
      sentences.push(practiceTemplates[v]);
    }

    return sentences.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  function formatGender(value) {
    const gender = String(value || '').trim();
    if (gender === 'They/Them') return 'They/them';
    if (gender === 'Not Specified') return 'Not specified';
    return gender;
  }

  function getPronouns(data = {}) {
    const gender = String(data.childGender || '').trim().toLowerCase();
    if (gender === 'male') return { subject: 'he', subjectCap: 'He', object: 'him', possessive: 'his', be: 'was' };
    if (gender === 'female') return { subject: 'she', subjectCap: 'She', object: 'her', possessive: 'her', be: 'was' };
    if (gender === 'they/them') return { subject: 'they', subjectCap: 'They', object: 'them', possessive: 'their', be: 'were' };
    return { subject: 'the child', subjectCap: 'The child', object: 'the child', possessive: "the child's", be: 'was' };
  }

  function describeSetting(data) {
    if (data.sessionSetting === 'Home') return 'in the home setting';
    if (data.sessionSetting === 'Daycare') return 'at daycare';
    if (data.sessionSetting === 'Other' && cleanPhrase(data.location)) return `at ${cleanPhrase(data.location)}`;
    if (cleanPhrase(data.location)) return `at ${cleanPhrase(data.location)}`;
    return '';
  }

  function buildPresentationSentence(data, variant) {
    const pronouns = getPronouns(data);
    const temperament = (data.temperament || []).map(v => String(v).toLowerCase());
    const engagement = (data.engagement || []).map(v => engagementMap[v] || String(v).toLowerCase());
    const behaviors = (data.toy || []).map(v => behaviorMap[v] || String(v).toLowerCase());
    if (!temperament.length && !engagement.length && !behaviors.length) return '';

    const sentences = [];
    if (temperament.length || engagement.length) {
      const tempText = temperament.length ? joinHuman(temperament) : '';
      const engageText = engagement.length ? joinHuman(engagement) : '';
      const templates = [
        temperament.length && engagement.length ? `${pronouns.subjectCap} presented as ${tempText} and ${pronouns.be} ${engageText} during activities.` : temperament.length ? `${pronouns.subjectCap} presented as ${tempText}.` : `${pronouns.subjectCap} ${pronouns.be} ${engageText} during activities.`,
        temperament.length && engagement.length ? `Throughout the session, ${pronouns.subject} appeared ${tempText} and remained ${engageText} during activities.` : temperament.length ? `Throughout the session, ${pronouns.subject} appeared ${tempText}.` : `Throughout the session, ${pronouns.subject} ${pronouns.be} ${engageText} during activities.`,
        temperament.length && engagement.length ? `${capitalize(pronouns.possessive)} presentation reflected a ${tempText} temperament with ${engageText} participation.` : temperament.length ? `${capitalize(pronouns.possessive)} presentation reflected a ${tempText} temperament.` : `${capitalize(pronouns.possessive)} participation was ${engageText}.`,
        temperament.length && engagement.length ? `During activities, ${pronouns.subject} appeared ${tempText} and demonstrated ${engageText} participation.` : temperament.length ? `During activities, ${pronouns.subject} appeared ${tempText}.` : `During activities, ${pronouns.subject} demonstrated ${engageText} participation.`,
        temperament.length && engagement.length ? `Across the visit, ${pronouns.subject} ${pronouns.be} ${tempText} and ${engageText} during therapeutic activities.` : temperament.length ? `Across the visit, ${pronouns.subject} ${pronouns.be} ${tempText}.` : `Across the visit, ${pronouns.subject} ${pronouns.be} ${engageText} during therapeutic activities.`,
        temperament.length && engagement.length ? `${pronouns.subjectCap} demonstrated a ${tempText} temperament and ${engageText} participation.` : temperament.length ? `${pronouns.subjectCap} demonstrated a ${tempText} temperament.` : `${pronouns.subjectCap} demonstrated ${engageText} participation.`
      ];
      sentences.push(templates[variant]);
    }

    if (behaviors.length) {
      const behaviorText = joinHuman(behaviors);
      const behaviorTemplates = [
        `Toy and play behavior included ${behaviorText}.`,
        `During play, ${pronouns.subject} demonstrated ${behaviorText}.`,
        `Observed toy/play behavior included ${behaviorText}.`,
        `Play-based activities were characterized by ${behaviorText}.`,
        `During toy-based activities, ${pronouns.subject} demonstrated ${behaviorText}.`,
        `Toy interaction during the session included ${behaviorText}.`
      ];
      sentences.push(behaviorTemplates[variant]);
    }
    return sentences.join(' ');
  }

  function buildCategorySentences(data, variant) {
    const out = [];
    const categories = [
      {
        group: 'socialInteraction', items: data.socialInteraction,
        starters: [
          'Social interaction activities addressed ',
          'Social interaction intervention targeted ',
          'Social interaction skills were practiced through ',
          'The session addressed social interaction skills including ',
          'Work on social interaction focused on ',
          'Social interaction goals included '
        ]
      },
      {
        group: 'selfConcept', items: data.selfConcept,
        starters: [
          'Self-concept activities addressed ',
          'Self-concept work focused on ',
          'Self-concept skills were practiced through ',
          'The session addressed self-concept skills including ',
          'Self-concept development was supported through ',
          'Self-concept goals included '
        ]
      },
      {
        group: 'fineMotor', items: data.fineMotor,
        starters: [
          'Motor activities targeted ',
          'Motor work focused on ',
          'Motor skills were addressed through ',
          'Activities supporting motor development included ',
          'Motor intervention emphasized ',
          'Motor goals included '
        ]
      },
      {
        group: 'receptive', items: data.receptive,
        starters: [
          'Receptive communication and cognitive activities focused on ',
          'Receptive and cognitive intervention addressed ',
          'Receptive communication and cognitive skills were practiced through ',
          'The session targeted receptive and cognitive skills including ',
          'Receptive communication and cognitive work emphasized ',
          'Receptive and cognitive goals included '
        ]
      },
      {
        group: 'socialSkills', items: data.socialSkills,
        starters: [
          'Social skills were supported through ',
          'Social-skill activities addressed ',
          'Social development was supported through ',
          'The session addressed social skills including ',
          'Social-skill intervention emphasized ',
          'Social goals included '
        ]
      },
      {
        group: 'expressive', items: data.expressive,
        starters: [
          'Language activities addressed ',
          'Language support included ',
          'Communication skills were encouraged through ',
          'The session supported language development through ',
          'Language intervention incorporated ',
          'Communication strategies included '
        ]
      }
    ];

    categories.forEach(cat => {
      if (!cat.items?.length) return;
      const desc = describeSkillsWithToys(cat.group, cat.items, data, variant);
      out.push(`${cat.starters[variant]}${desc}.`);
    });
    return out;
  }

  function describeSkillsWithToys(group, items, data, variant) {
    const pronouns = getPronouns(data);
    return joinHuman(items.map(skill => {
      const base = describeSkillDetail(group, skill, data);
      const key = toyKey(group, skill);
      const toy = cleanPhrase(data.skillToys?.[key] || '');
      if (!toy) return base;
      const connectors = ['using', 'with', 'while using', 'with the use of', 'using', 'with'];
      const activity = `${base} ${connectors[variant % connectors.length]} ${toy}`;
      const performance = data.skillPerformance?.[key] || '';
      if (performance === 'Succeeded') return `${activity}, during which ${pronouns.subject} demonstrated success`;
      if (performance === 'Needed Support') return `${activity}, during which ${pronouns.subject} required support`;
      if (performance === 'Struggled') return `${activity}, which was challenging for ${pronouns.object}`;
      return activity;
    }));
  }

  function describeSkillDetail(group, skill, data) {
    const base = phraseMap[skill] || String(skill).toLowerCase();
    if (group === 'receptive' && skill === 'Understanding Prepositions') {
      const selected = [...(data.prepositions || [])].map(v => normalizeTargetLabel(v));
      const custom = splitCustomTargets(data.otherPrepositions);
      const targets = [...selected, ...custom];
      if (targets.length) return `understanding prepositions including ${joinHuman(targets)}`;
    }
    if (group === 'receptive' && skill === 'WH Questions') {
      const selected = [...(data.whQuestions || [])].map(v => String(v).toLowerCase());
      const custom = splitCustomTargets(data.otherWhQuestions);
      const targets = [...selected, ...custom];
      if (targets.length) return `WH questions targeting ${joinHuman(targets)}`;
    }
    return base;
  }

  function normalizeTargetLabel(value) {
    return String(value || '')
      .replace(/\s*\/\s*/g, '/')
      .toLowerCase();
  }

  function splitCustomTargets(value) {
    return String(value || '')
      .split(/[,;\n]+/)
      .map(v => v.trim().toLowerCase())
      .filter(Boolean);
  }

  function updateConditionalDetails(changedEl = null) {
    const coTreatChecked = checkedField('coTreat');
    const coWrap = byId('coTreatWithWrap');
    if (coWrap) coWrap.classList.toggle('hidden', !coTreatChecked);
    if (!coTreatChecked && changedEl?.matches('input[data-field="coTreat"]') && els.coTreatWith) els.coTreatWith.value = '';

    const receptiveSelected = new Set(checkedGroup('receptive'));
    const showPrep = receptiveSelected.has('Understanding Prepositions');
    const showWh = receptiveSelected.has('WH Questions');
    byId('prepositionDetails')?.classList.toggle('hidden', !showPrep);
    byId('whQuestionDetails')?.classList.toggle('hidden', !showWh);

    if (changedEl?.matches('input[data-group="receptive"]')) {
      if (!showPrep) {
        setCheckedGroup('prepositions', []);
        if (els.otherPrepositions) els.otherPrepositions.value = '';
      }
      if (!showWh) {
        setCheckedGroup('whQuestions', []);
        if (els.otherWhQuestions) els.otherWhQuestions.value = '';
      }
    }
  }

  function buildClinicianNoteSentence(text, variant, data = {}) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const pronouns = getPronouns(data);
    const words = detectWordList(raw);
    if (words) {
      const starts = [
        'Words produced during the session included ',
        'Spontaneous or imitated words heard during the visit included ',
        'Verbal productions noted during the session included ',
        `${pronouns.subjectCap} used or imitated words including `,
        'Words heard during today’s activities included ',
        'Speech and language productions noted today included '
      ];
      return `${starts[variant]}${joinHuman(words)}.`;
    }
    const starts = [
      'Additional clinician observations: ',
      'The clinician additionally noted: ',
      'Additional observations from the session included the following: ',
      'The therapist also documented: ',
      'Other relevant session observations included: ',
      'Additional session notes indicated: '
    ];
    return `${starts[variant]}${ensureSentence(raw)}`;
  }

  function detectWordList(text) {
    let candidate = text.trim().replace(/[.]+$/, '');
    const explicit = candidate.match(/^words?\s*:\s*(.+)$/i);
    if (explicit) candidate = explicit[1];
    if (!candidate.includes(',')) return null;
    if (/[.!?;]/.test(candidate)) return null;
    const items = candidate.split(',').map(x => x.trim()).filter(Boolean);
    if (items.length < 2 || items.length > 20) return null;
    if (items.some(x => x.split(/\s+/).length > 4)) return null;
    return items;
  }

  function updateGeneratedAndPreview() {
    const data = collectFormData();
    const generated = buildFinalNarrative(data);
    els.variantLabel.textContent = `Version ${noteVariantIndex + 1} of ${VARIANT_COUNT}`;
    if (generated) {
      els.generatedNote.textContent = generated;
      els.generatedNote.classList.remove('placeholder');
    } else {
      els.generatedNote.textContent = 'Choose session details and therapy targets above to generate the narrative.';
      els.generatedNote.classList.add('placeholder');
    }

    byId('pChildName').textContent = data.childName;
    if (byId('pGender')) byId('pGender').textContent = formatGender(data.childGender);
    byId('pDate').textContent = formatDate(data.dateOfService);
    byId('pTime').textContent = formatTimeRange(data.timeIn, data.timeOut);
    byId('pNext').textContent = formatDateTime(data.nextAppointment);
    byId('pLocation').textContent = data.location;
    byId('pPresent').textContent = data.whoPresent;
    byId('pTherapist').textContent = data.therapistName;
    byId('pNarrative').textContent = generated;

    const narrative = byId('pNarrative');
    const len = generated.length;
    narrative.style.fontSize = len > 3000 ? '7.5px' : len > 2200 ? '8px' : len > 1500 ? '9px' : len > 950 ? '10px' : '11px';
    redrawPreviewSignatures();
  }

  async function copyGeneratedNote() {
    const note = buildFinalNarrative(collectFormData());
    if (!note) return toast('Nothing to copy yet.');
    try {
      await navigator.clipboard.writeText(note);
      toast('Generated narrative copied.');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = note;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('Generated narrative copied.');
    }
  }

  function downloadPdf() {
    const data = collectFormData();
    if (!data.childName.trim()) return alert('Please enter or select a child first.');
    const blob = createPdfBlob(data);
    downloadBlob(blob, buildFilename(data, 'pdf'));
    toast('PDF downloaded with signatures.');
  }

  function downloadRtf() {
    const data = collectFormData();
    if (!data.childName.trim()) return alert('Please enter or select a child first.');
    const rtf = buildRtf(data);
    downloadBlob(new Blob([rtf], { type: 'application/rtf' }), buildFilename(data, 'rtf'));
    toast('Word-compatible RTF downloaded.');
  }

  async function sharePdf() {
    const data = collectFormData();
    if (!data.childName.trim()) return alert('Please enter or select a child first.');
    const blob = createPdfBlob(data);
    const file = new File([blob], buildFilename(data, 'pdf'), { type: 'application/pdf' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Therapy Note - ${data.childName}`,
          text: `Therapy note for ${data.childName} (${formatDate(data.dateOfService)}).`,
          files: [file]
        });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    downloadBlob(blob, file.name);
    const subject = encodeURIComponent(`Therapy Note - ${data.childName} - ${formatDate(data.dateOfService)}`);
    const body = encodeURIComponent('The signed therapy note PDF has been downloaded to this computer. Please attach it using your approved secure email system.');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast('Signed PDF downloaded. Attach it to the email window that opens.');
  }

  function exportBackup() {
    const backup = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    downloadBlob(new Blob([backup], { type: 'application/json' }), `Above_Beyond_Notes_Backup_${todayISO()}.json`);
    toast('Backup exported.');
  }

  async function importBackup(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Importing a backup will replace the children and sessions currently saved in this browser. Continue?')) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.clients) || !Array.isArray(parsed.sessions)) throw new Error('Invalid backup');
      const normalized = normalizeState(parsed);
      state.clients = normalized.clients;
      state.sessions = normalized.sessions;
      state.settings = normalized.settings;
      state.lastSelectedChildId = normalized.lastSelectedChildId;
      selectedChildId = state.lastSelectedChildId;
      persist();
      renderChildren();
      renderHistory();
      resetForm(!!selectedChildId);
      if (selectedChildId) {
        const child = state.clients.find(c => c.id === selectedChildId);
        if (child) els.childName.value = child.name;
      }
      els.therapistName.value = state.settings.therapistName || '';
      updateGeneratedAndPreview();
      toast('Backup imported.');
    } catch {
      alert('That file does not appear to be a valid Above & Beyond Notes backup.');
    }
  }

  function createPdfBlob(data) {
    const narrative = buildFinalNarrative(data);
    const left = 45, right = 567;
    const pages = [];
    const wrap = (text, maxWidth, fontSize, bold = false) => wrapForPdf(text || '', maxWidth, fontSize, bold);
    const page = [];
    const T = (text, x, y, size = 10, bold = false) => page.push(pdfText(text, x, y, size, bold));
    const L = (x1,y1,x2,y2,w=.7) => page.push(`${w} w ${x1} ${y1} m ${x2} ${y2} l S`);

    T('Above and Beyond Pediatric Therapy:', 155, 748, 16, true);
    T("Accelerating your child's potential to new heights", 191, 731, 10, false);
    T('Phone 708-307-5462 Fax 708-221-7173', 199, 718, 9, false);
    T('aboveandbeyondtherapy@hotmail.com', 202, 705, 9, false);

    function field(label, value, x, y, width) {
      T(label, x, y, 9.5, true);
      const labelW = approxTextWidth(label, 9.5, true) + 4;
      T(value || '', x + labelW, y, 9.5, false);
      L(x + labelW, y - 2, x + width, y - 2, .55);
    }

    field("Child's Name:", data.childName, left, 667, 178);
    field('Gender:', formatGender(data.childGender), 225, 667, 72);
    field('Date of Service:', formatDate(data.dateOfService), 315, 667, 252);
    field('Time In/Out:', formatTimeRange(data.timeIn, data.timeOut), left, 638, 240);
    field('Next Appointment:', formatDateTime(data.nextAppointment), 315, 638, 252);
    field('Location:', data.location, left, 609, 240);
    field('Who was Present:', data.whoPresent, 315, 609, 252);

    T('Narrative:', left, 575, 10, true);
    T('Describe how skills were worked on in session. What you did and why', 95, 575, 9.5, false);

    const fontSize = narrative.length > 3000 ? 7.2 : narrative.length > 2200 ? 7.8 : narrative.length > 1500 ? 8.5 : 9.2;
    const narrativeLines = wrap(narrative, right-left, fontSize, false);
    let y = 553;
    const signatureTop = 122;
    const lineHeight = fontSize + 3.5;
    const maxNarrativeLines = Math.max(1, Math.floor((y - signatureTop) / lineHeight));
    narrativeLines.slice(0, maxNarrativeLines).forEach(line => {
      T(line, left, y, fontSize, false);
      y -= lineHeight;
    });

    T("Therapist's Signature:", left, 92, 9.5, true);
    L(148, 76, 345, 76, .6);
    page.push(signaturePdfCommands(data.signatures?.therapist || [], 148, 78, 197, 30));
    T('Therapist Name:', 365, 92, 9.5, true);
    T(data.therapistName || '', 450, 92, 9.5, false);
    L(448, 76, right, 76, .6);

    T("Parent's Signature:", left, 50, 9.5, true);
    L(142, 34, 425, 34, .6);
    page.push(signaturePdfCommands(data.signatures?.parent || [], 142, 36, 283, 30));
    pages.push(page.filter(Boolean).join('\n'));

    const overflow = narrativeLines.slice(maxNarrativeLines);
    if (overflow.length) {
      let remaining = [...overflow];
      while (remaining.length) {
        const p = [];
        const TT = (text, x, yy, size = 10, bold = false) => p.push(pdfText(text, x, yy, size, bold));
        TT('Above and Beyond Pediatric Therapy - Narrative Continuation', left, 748, 14, true);
        TT(`${data.childName || 'Child'} - ${formatDate(data.dateOfService)}`, left, 729, 10, false);
        let yy = 690;
        const maxLines = Math.floor((yy - 65) / lineHeight);
        remaining.slice(0, maxLines).forEach(line => {
          TT(line, left, yy, fontSize, false);
          yy -= lineHeight;
        });
        remaining = remaining.slice(maxLines);
        pages.push(p.join('\n'));
      }
    }

    return buildPdfDocument(pages);
  }

  function signaturePdfCommands(strokes, x, y, w, h) {
    if (!Array.isArray(strokes) || !strokes.length) return '';
    const commands = ['1.2 w 0 0 0 RG'];
    strokes.forEach(stroke => {
      if (!Array.isArray(stroke) || !stroke.length) return;
      const first = stroke[0];
      const fx = x + clamp01(first.x) * w;
      const fy = y + (1 - clamp01(first.y)) * h;
      commands.push(`${fx.toFixed(2)} ${fy.toFixed(2)} m`);
      if (stroke.length === 1) {
        commands.push(`${(fx + .5).toFixed(2)} ${(fy + .5).toFixed(2)} l S`);
      } else {
        for (let i = 1; i < stroke.length; i++) {
          const p = stroke[i];
          const px = x + clamp01(p.x) * w;
          const py = y + (1 - clamp01(p.y)) * h;
          commands.push(`${px.toFixed(2)} ${py.toFixed(2)} l`);
        }
        commands.push('S');
      }
    });
    return commands.join('\n');
  }

  function buildPdfDocument(pageStreams) {
    const objects = [];
    const catalogObj = 1;
    const pagesObj = 2;
    const fontNormalObj = 3;
    const fontBoldObj = 4;
    let nextObj = 5;
    const pageObjectNums = [];
    const contentObjectNums = [];
    pageStreams.forEach(() => {
      pageObjectNums.push(nextObj++);
      contentObjectNums.push(nextObj++);
    });

    objects[catalogObj] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
    objects[pagesObj] = `<< /Type /Pages /Kids [${pageObjectNums.map(n => `${n} 0 R`).join(' ')}] /Count ${pageObjectNums.length} >>`;
    objects[fontNormalObj] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
    objects[fontBoldObj] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

    pageStreams.forEach((stream, i) => {
      const pObj = pageObjectNums[i], cObj = contentObjectNums[i];
      objects[pObj] = `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontNormalObj} 0 R /F2 ${fontBoldObj} 0 R >> >> /Contents ${cObj} 0 R >>`;
      objects[cObj] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (let i = 1; i < objects.length; i++) {
      offsets[i] = pdf.length;
      pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objects.length; i++) pdf += `${String(offsets[i]).padStart(10,'0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogObj} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf], { type: 'application/pdf' });
  }

  function pdfText(text, x, y, size, bold) {
    const cleaned = pdfSafe(text);
    return `BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${cleaned}) Tj ET`;
  }

  function pdfSafe(text) {
    return String(text || '')
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-').replace(/…/g, '...')
      .replace(/[^\x20-\x7E]/g, '?')
      .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function wrapForPdf(text, maxWidth, fontSize, bold) {
    const paragraphs = String(text || '').split(/\n+/);
    const lines = [];
    paragraphs.forEach((para, pi) => {
      const words = para.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        if (pi < paragraphs.length - 1) lines.push('');
        return;
      }
      let line = '';
      words.forEach(word => {
        const test = line ? `${line} ${word}` : word;
        if (approxTextWidth(test, fontSize, bold) <= maxWidth) line = test;
        else {
          if (line) lines.push(line);
          line = word;
        }
      });
      if (line) lines.push(line);
      if (pi < paragraphs.length - 1) lines.push('');
    });
    return lines;
  }

  function approxTextWidth(text, fontSize, bold) {
    let units = 0;
    for (const ch of String(text || '')) {
      if ('il.,:;!|\' '.includes(ch)) units += 0.28;
      else if ('MW@#%&'.includes(ch)) units += 0.9;
      else if (/[A-Z0-9]/.test(ch)) units += 0.62;
      else units += 0.52;
    }
    return units * fontSize * (bold ? 1.02 : 1);
  }

  function buildRtf(data) {
    const narrative = buildFinalNarrative(data);
    const r = escapeRtf;
    const therapistSig = signatureToRtfPng(data.signatures?.therapist || [], 720, 150, 2800, 580);
    const parentSig = signatureToRtfPng(data.signatures?.parent || [], 900, 150, 3600, 580);
    return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}{\\f1 Times New Roman;}}\n` +
      `\\paperw12240\\paperh15840\\margl900\\margr900\\margt720\\margb720\n` +
      `\\qc\\f1\\b\\fs32 ${r('Above and Beyond Pediatric Therapy:')}\\b0\\fs20\\par\n` +
      `${r("Accelerating your child's potential to new heights")}\\par\n${r('Phone 708-307-5462 Fax 708-221-7173')}\\par\n${r('aboveandbeyondtherapy@hotmail.com')}\\par\n\\pard\\ql\\f0\\fs20\\par\n` +
      `\\b Child's Name:\\b0  ${r(data.childName)}\\tab \\b Gender:\\b0  ${r(formatGender(data.childGender))}\\tab \\b Date of Service:\\b0  ${r(formatDate(data.dateOfService))}\\par\n` +
      `\\b Time In/Out:\\b0  ${r(formatTimeRange(data.timeIn, data.timeOut))}\\tab\\tab \\b Next Appointment:\\b0  ${r(formatDateTime(data.nextAppointment))}\\par\n` +
      `\\b Location:\\b0  ${r(data.location)}\\tab\\tab \\b Who was Present:\\b0  ${r(data.whoPresent)}\\par\n\\par\n` +
      `\\b Narrative:\\b0  ${r('Describe how skills were worked on in session. What you did and why')}\\par\n${r(narrative)}\\par\n\\par\n` +
      `\\b Therapist's Signature:\\b0\\par\n${therapistSig || r('________________________________')}\\par\n` +
      `\\b Therapist Name:\\b0  ${r(data.therapistName)}\\par\n\\par\n` +
      `\\b Parent's Signature:\\b0\\par\n${parentSig || r('____________________________________________')}\\par\n}`;
  }

  function signatureToRtfPng(strokes, widthPx, heightPx, goalW, goalH) {
    if (!Array.isArray(strokes) || !strokes.length) return '';
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    strokes.forEach(stroke => {
      if (!stroke?.length) return;
      ctx.beginPath();
      stroke.forEach((p, i) => {
        const x = clamp01(p.x) * widthPx;
        const y = clamp01(p.y) * heightPx;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      if (stroke.length === 1) ctx.lineTo(clamp01(stroke[0].x) * widthPx + 1, clamp01(stroke[0].y) * heightPx + 1);
      ctx.stroke();
    });
    const base64 = canvas.toDataURL('image/png').split(',')[1];
    const binary = atob(base64);
    let hex = '';
    for (let i = 0; i < binary.length; i++) hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
    return `{\\pict\\pngblip\\picw${widthPx}\\pich${heightPx}\\picwgoal${goalW}\\pichgoal${goalH} ${hex}}`;
  }

  function escapeRtf(text) {
    return String(text || '').replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}')
      .replace(/\n/g, '\\line ')
      .replace(/[^\x00-\x7F]/g, ch => `\\u${ch.charCodeAt(0)}?`);
  }

  function setupSignaturePad(canvasId, type) {
    const canvas = byId(canvasId);
    if (!canvas) return;
    canvas.style.touchAction = 'none';

    canvas.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      canvas.setPointerCapture?.(e.pointerId);
      const p = signaturePoint(canvas, e);
      const stroke = [p];
      signatureStrokes[type].push(stroke);
      activeSignaturePointers.set(`${type}:${e.pointerId}`, stroke);
      drawSignatureCanvas(canvas, signatureStrokes[type]);
      markDirty();
    });

    canvas.addEventListener('pointermove', e => {
      const key = `${type}:${e.pointerId}`;
      const stroke = activeSignaturePointers.get(key);
      if (!stroke) return;
      e.preventDefault();
      const p = signaturePoint(canvas, e);
      const last = stroke[stroke.length - 1];
      if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) < 0.0015) return;
      stroke.push(p);
      drawSignatureCanvas(canvas, signatureStrokes[type]);
    });

    const finish = e => {
      const key = `${type}:${e.pointerId}`;
      if (!activeSignaturePointers.has(key)) return;
      activeSignaturePointers.delete(key);
      markDirty();
      redrawPreviewSignatures();
    };
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);
    canvas.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse' && activeSignaturePointers.has(`${type}:${e.pointerId}`)) finish(e);
    });
  }

  function signaturePoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp01((event.clientX - rect.left) / Math.max(1, rect.width)),
      y: clamp01((event.clientY - rect.top) / Math.max(1, rect.height)),
      pressure: typeof event.pressure === 'number' ? event.pressure : 0.5
    };
  }

  function clearSignature(type) {
    signatureStrokes[type] = [];
    markDirty();
    redrawAllSignatureCanvases();
    toast(`${type === 'therapist' ? 'Therapist' : 'Parent'} signature cleared.`);
  }

  function redrawAllSignatureCanvases() {
    drawSignatureCanvas(byId('therapistSignaturePad'), signatureStrokes.therapist);
    drawSignatureCanvas(byId('parentSignaturePad'), signatureStrokes.parent);
    redrawPreviewSignatures();
  }

  function redrawPreviewSignatures() {
    drawSignatureCanvas(byId('pTherapistSignature'), signatureStrokes.therapist, true);
    drawSignatureCanvas(byId('pParentSignature'), signatureStrokes.parent, true);
  }

  function drawSignatureCanvas(canvas, strokes, preview = false) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(10, rect.width || (preview ? 230 : 500));
    const cssHeight = Math.max(10, rect.height || (preview ? 42 : 150));
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const targetW = Math.round(cssWidth * dpr);
    const targetH = Math.round(cssHeight * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = preview ? 1.4 : 2.1;

    (strokes || []).forEach(stroke => {
      if (!stroke?.length) return;
      ctx.beginPath();
      stroke.forEach((p, i) => {
        const x = clamp01(p.x) * cssWidth;
        const y = clamp01(p.y) * cssHeight;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      if (stroke.length === 1) ctx.lineTo(clamp01(stroke[0].x) * cssWidth + 0.5, clamp01(stroke[0].y) * cssHeight + 0.5);
      ctx.stroke();
    });
  }

  function normalizeSignatures(signatures) {
    const safe = { therapist: [], parent: [] };
    ['therapist', 'parent'].forEach(type => {
      if (!Array.isArray(signatures?.[type])) return;
      safe[type] = signatures[type]
        .filter(Array.isArray)
        .map(stroke => stroke.map(p => ({
          x: clamp01(Number(p.x) || 0),
          y: clamp01(Number(p.y) || 0),
          pressure: Number(p.pressure) || 0.5
        })));
    });
    return safe;
  }

  function checkedField(name) {
    return !!document.querySelector(`input[data-field="${name}"]`)?.checked;
  }

  function setCheckedField(name, value) {
    const el = document.querySelector(`input[data-field="${name}"]`);
    if (el) el.checked = !!value;
  }

  function checkedGroup(name) {
    return Array.from(document.querySelectorAll(`input[data-group="${name}"]:checked`)).map(i => i.value);
  }

  function setCheckedGroup(name, values) {
    const set = new Set(values || []);
    document.querySelectorAll(`input[data-group="${name}"]`).forEach(i => i.checked = set.has(i.value));
  }

  function joinHuman(items) {
    const arr = items.filter(Boolean);
    if (!arr.length) return '';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0,-1).join(', ')}, and ${arr[arr.length-1]}`;
  }

  function cleanPhrase(s) {
    return String(s || '').trim().replace(/[.]+$/,'');
  }

  function lowerFirst(s) {
    return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function ensureSentence(s) {
    const t = String(s || '').trim();
    if (!t) return '';
    return /[.!?]$/.test(t) ? t : `${t}.`;
  }

  function articleFor(phrase) {
    return /^[aeiou]/i.test(String(phrase || '').trim()) ? 'an' : 'a';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const [y,m,d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m-1, d).toLocaleDateString('en-US', { month:'numeric', day:'numeric', year:'numeric' });
  }

  function formatDateTime(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('en-US', { month:'numeric', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' });
  }

  function formatTime(t) {
    if (!t) return '';
    const [h,m] = t.split(':').map(Number);
    if (Number.isNaN(h)) return t;
    return new Date(2000,0,1,h,m||0).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
  }

  function formatTimeRange(a,b) {
    return [formatTime(a), formatTime(b)].filter(Boolean).join(' - ');
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  }

  function buildFilename(data, ext) {
    const safeName = (data.childName || 'Child').trim().replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'');
    return `${safeName || 'Child'}_Therapy_Note_${data.dateOfService || todayISO()}.${ext}`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  function normalizeState(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    const clients = Array.isArray(base.clients)
      ? base.clients.map(c => ({ ...c, gender: c.gender || '' }))
      : [];
    const genderById = Object.fromEntries(clients.map(c => [c.id, c.gender || '']));
    const sessions = Array.isArray(base.sessions)
      ? base.sessions.map(s => {
          const receptive = (s.receptive || []).map(item => item === 'Visual Tracker' ? 'Visual Tracking' : item);
          const skillToys = { ...(s.skillToys || {}) };
          const skillPerformance = { ...(s.skillPerformance || {}) };
          if (skillToys['receptive::Visual Tracker'] && !skillToys['receptive::Visual Tracking']) {
            skillToys['receptive::Visual Tracking'] = skillToys['receptive::Visual Tracker'];
          }
          if (skillPerformance['receptive::Visual Tracker'] && !skillPerformance['receptive::Visual Tracking']) {
            skillPerformance['receptive::Visual Tracking'] = skillPerformance['receptive::Visual Tracker'];
          }
          delete skillToys['receptive::Visual Tracker'];
          delete skillPerformance['receptive::Visual Tracker'];
          return ({
          ...s,
          childGender: s.childGender || genderById[s.childId] || '',
          selfConcept: s.selfConcept || [],
          fineMotor: s.fineMotor || [],
          receptive,
          socialSkills: s.socialSkills || [],
          expressive: s.expressive || [],
          coTreatWith: s.coTreatWith || '',
          prepositions: s.prepositions || [],
          otherPrepositions: s.otherPrepositions || '',
          whQuestions: s.whQuestions || [],
          otherWhQuestions: s.otherWhQuestions || '',
          noteVariant: Number.isInteger(s.noteVariant) ? s.noteVariant : 0,
          skillToys,
          skillPerformance,
          signatures: normalizeSignatures(s.signatures)
        });
        })
      : [];
    return {
      clients,
      sessions,
      settings: base.settings || {},
      lastSelectedChildId: base.lastSelectedChildId || null
    };
  }

  function loadState() {
    const keys = [STORAGE_KEY, LEGACY_V3_STORAGE_KEY, LEGACY_V2_STORAGE_KEY, LEGACY_STORAGE_KEY];
    for (const key of keys) {
      try {
        const saved = JSON.parse(localStorage.getItem(key));
        if (saved && Array.isArray(saved.clients) && Array.isArray(saved.sessions)) return normalizeState(saved);
      } catch {}
    }
    return { clients: [], sessions: [], settings: {}, lastSelectedChildId: null };
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      alert('The browser could not save data locally. Please export a backup and check browser storage settings.');
    }
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function clamp01(n) {
    return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }
})();
