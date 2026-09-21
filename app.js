// ==========================================================================
// TakeOFF Driver Onboarding Engine — Complete State & Database System
// Palette: Mint / Emerald (#10B981), Slate (#0F172A), Border (#E2E8F0)
// Candidate: Munyaradzi Chakwenya (+263 712 599 823)
// ==========================================================================

const STORAGE_KEY = 'TAKEOFF_DRIVER_PROFILES_V1';

// Preloaded Realistic Driver Profiles for Assessment Demonstration
const INITIAL_PROFILES = [
  {
    id: 'TKF-DRV-8492',
    timestamp: '2026-09-20T14:32:00Z',
    status: 'Approved',
    personal: {
      fullName: 'Tinashe Moyo',
      email: 'tinashe.moyo@gmail.com',
      phone: '+263 77 234 5678',
      dob: '1995-04-12',
      city: 'Harare (CBD & Borrowdale)',
      emergencyName: 'Ruvimbo Moyo',
      emergencyPhone: '+263 71 890 1234'
    },
    identity: {
      idType: 'National ID Card',
      idNumber: '63-1284920-K-42',
      frontUploaded: true,
      backUploaded: true,
      compressionSize: '342 KB · WebP'
    },
    vehicle: {
      type: 'Motorbike',
      iconName: 'bike',
      make: 'Honda',
      model: 'Ace 125',
      year: '2022',
      plate: 'AFE-8921',
      color: 'Red & Black',
      capacity: 'Up to 25 kg · 45L Top Box'
    },
    documents: {
      licenseNumber: 'DL-904821-ZW',
      licenseClass: 'Class 3 (Motorcycle)',
      expiry: '2028-11-30',
      insurancePolicy: 'OLD-MUT-8849102',
      roadworthyExpiry: '2027-05-15',
      verified: true
    },
    signature: 'digital_verified_hash_9482',
    notes: 'Experienced courier with 3 years food & parcel dispatch experience in Harare.'
  },
  {
    id: 'TKF-DRV-9104',
    timestamp: '2026-09-21T08:15:00Z',
    status: 'Under Review',
    personal: {
      fullName: 'Farai Mutasa',
      email: 'f.mutasa@outlook.com',
      phone: '+263 71 456 7890',
      dob: '1989-08-24',
      city: 'Bulawayo (Suburbs & Belmont)',
      emergencyName: 'Grace Mutasa',
      emergencyPhone: '+263 77 987 6543'
    },
    identity: {
      idType: 'National ID Card',
      idNumber: '08-4920194-R-08',
      frontUploaded: true,
      backUploaded: true,
      compressionSize: '418 KB · WebP'
    },
    vehicle: {
      type: 'Delivery Van',
      iconName: 'truck',
      make: 'Toyota',
      model: 'HiAce Commuter',
      year: '2019',
      plate: 'AGE-4412',
      color: 'White',
      capacity: 'Up to 1,200 kg · Bulk Freight'
    },
    documents: {
      licenseNumber: 'DL-391042-ZW',
      licenseClass: 'Class 2 (Heavy Vehicle)',
      expiry: '2029-03-14',
      insurancePolicy: 'NICOZ-DI-91028',
      roadworthyExpiry: '2027-02-28',
      verified: true
    },
    signature: 'digital_verified_hash_1042',
    notes: 'Commercial distribution driver for hardware & FMCG merchants.'
  }
];

class OnboardingState {
  constructor() {
    this.currentStep = 'splash'; // splash, auth, otp, step1, step2, step3, step4, step5, celebration
    this.otpTimer = 45;
    this.timerInterval = null;
    this.fullWidth = false;
    this.activeProfileModal = null;

    // Active Application Draft (Preloaded with registered candidate details)
    this.draft = {
      phone: '+263 712 599 823',
      otpChannel: 'whatsapp',
      fullName: 'Munyaradzi Chakwenya',
      email: 'munyaradzichakwenya60@gmail.com',
      dob: '1998-06-15',
      city: 'Harare (CBD & Greater)',
      emergencyName: 'Tafadzwa Chakwenya',
      emergencyPhone: '+263 77 123 4567',
      idType: 'National ID Card',
      idNumber: '63-2940182-M-63',
      idFrontUploaded: true,
      idBackUploaded: true,
      vehicleType: 'Motorbike',
      vehicleMake: 'Honda',
      vehicleModel: 'CG125',
      vehicleYear: '2023',
      vehiclePlate: 'AFG-7729',
      vehicleColor: 'Gloss Black',
      licenseNumber: 'DL-842918-ZW',
      licenseClass: 'Class 3 (Motorcycle)',
      licenseExpiry: '2028-09-30',
      insurancePolicy: 'ZIMNAT-COMM-94821',
      roadworthyExpiry: '2027-08-31',
      licenseDocUploaded: true,
      insuranceDocUploaded: true,
      agreedTerms: true,
      hasSigned: true
    };

    this.initDatabase();
    this.bindGlobalEvents();
    this.render();
  }

  initDatabase() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILES));
    }
  }

  getProfiles() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_PROFILES;
    } catch (e) {
      return INITIAL_PROFILES;
    }
  }

  saveProfile(profile) {
    const profiles = this.getProfiles();
    profiles.unshift(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    this.updateReviewerBadge();
  }

  updateStatus(id, newStatus) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      profiles[idx].status = newStatus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
      this.renderReviewerList();
      if (this.activeProfileModal === id) {
        this.viewProfileDetails(id);
      }
    }
  }

  goTo(step) {
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  }

  startOtpCountdown() {
    clearInterval(this.timerInterval);
    this.otpTimer = 45;
    const timerElem = document.getElementById('otp-timer-count');
    if (timerElem) timerElem.textContent = `${this.otpTimer}s`;
    
    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      const el = document.getElementById('otp-timer-count');
      const resendBtn = document.getElementById('btn-resend-otp');
      if (el) el.textContent = `${this.otpTimer}s`;
      if (this.otpTimer <= 0) {
        clearInterval(this.timerInterval);
        if (resendBtn) resendBtn.classList.remove('opacity-50', 'pointer-events-none');
      }
    }, 1000);
  }

  updateReviewerBadge() {
    const count = this.getProfiles().length;
    const badge = document.getElementById('reviewer-count-badge');
    if (badge) badge.textContent = `${count} Profiles`;
  }

  bindGlobalEvents() {
    // Layout Switcher Toggle
    const modeBtn = document.getElementById('btn-toggle-layout');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.fullWidth = !this.fullWidth;
        const frame = document.getElementById('main-phone-frame');
        if (this.fullWidth) {
          frame.classList.add('full-width-mode');
          modeBtn.innerHTML = `<i data-lucide='smartphone' class='w-3.5 h-3.5'></i><span>Mobile View</span>`;
        } else {
          frame.classList.remove('full-width-mode');
          modeBtn.innerHTML = `<i data-lucide='maximize' class='w-3.5 h-3.5'></i><span>Expanded View</span>`;
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Reviewer Drawer Open/Close
    const openReviewerBtn = document.getElementById('btn-open-reviewer');
    const closeReviewerBtn = document.getElementById('btn-close-reviewer');
    const drawer = document.getElementById('reviewer-drawer');
    const backdrop = document.getElementById('reviewer-backdrop');

    if (openReviewerBtn) {
      openReviewerBtn.addEventListener('click', () => {
        this.renderReviewerList();
        drawer.classList.add('open');
        backdrop.classList.add('open');
      });
    }

    if (closeReviewerBtn) {
      closeReviewerBtn.addEventListener('click', () => {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
      });
    }

    // Export Database JSON
    const exportBtn = document.getElementById('btn-export-db');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.getProfiles(), null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', dataStr);
        dlAnchor.setAttribute('download', `takeoff_driver_profiles_${Date.now()}.json`);
        dlAnchor.click();
      });
    }

    // Reset Database Demo Data
    const resetBtn = document.getElementById('btn-reset-db');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset application database to default test profiles?')) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILES));
          this.goTo('splash');
          this.updateReviewerBadge();
          this.renderReviewerList();
        }
      });
    }
  }

  getVehicleIcon(type) {
    switch (type) {
      case 'Motorbike': return 'bike';
      case 'Courier Car': return 'car';
      case 'Delivery Van': return 'truck';
      case 'Cargo Truck': return 'container';
      default: return 'car';
    }
  }

  renderReviewerList(filter = '') {
    const container = document.getElementById('reviewer-profiles-container');
    if (!container) return;
    const profiles = this.getProfiles();
    
    const filtered = profiles.filter(p => {
      const q = filter.toLowerCase();
      return p.personal.fullName.toLowerCase().includes(q) ||
             p.personal.phone.toLowerCase().includes(q) ||
             p.vehicle.type.toLowerCase().includes(q) ||
             p.id.toLowerCase().includes(q) ||
             p.personal.city.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class='text-center py-16 text-slate-500'>
          <div class='w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400 shadow-sm'>
            <i data-lucide='search' class='w-6 h-6 text-slate-400'></i>
          </div>
          <p class='font-bold text-slate-800 text-sm'>No driver applications match your query</p>
          <p class='text-xs text-slate-500 mt-1'>Try searching by name, vehicle, or phone.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(p => {
      const iconName = this.getVehicleIcon(p.vehicle.type);
      const isApproved = p.status === 'Approved';
      const isReview = p.status === 'Under Review';
      
      const statusBadge = isApproved 
        ? `<span class='px-3 py-1 text-[11px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'>Approved</span>`
        : isReview 
        ? `<span class='px-3 py-1 text-[11px] font-extrabold rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'>Under Review</span>`
        : `<span class='px-3 py-1 text-[11px] font-extrabold rounded-full bg-rose-100 text-rose-900 border border-rose-300 shadow-xs'>Rejected</span>`;

      return `
        <div class='bg-white border border-slate-200 rounded-2xl p-4 transition hover:border-emerald-500 hover:shadow-md shadow-xs'>
          <div class='flex items-center justify-between mb-3'>
            <div class='flex items-center gap-3'>
              <div class='w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 font-bold'>
                <i data-lucide='${iconName}' class='w-5 h-5 text-emerald-600'></i>
              </div>
              <div>
                <h4 class='font-black text-slate-900 text-sm tracking-tight'>${p.personal.fullName}</h4>
                <p class='text-xs font-semibold text-slate-600 mt-0.5'>${p.personal.phone} · ${p.personal.city.split(' ')[0]}</p>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div class='grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/90 my-2.5'>
            <div><span class='text-slate-500 font-bold'>Ref ID:</span> <span class='font-mono font-black text-emerald-700'>${p.id}</span></div>
            <div><span class='text-slate-500 font-bold'>Vehicle:</span> <span class='font-bold text-slate-900'>${p.vehicle.make} ${p.vehicle.model}</span></div>
            <div><span class='text-slate-500 font-bold'>Plate:</span> <span class='font-mono font-black text-slate-900 uppercase'>${p.vehicle.plate}</span></div>
            <div><span class='text-slate-500 font-bold'>License:</span> <span class='font-mono font-bold text-slate-900'>${p.documents.licenseNumber}</span></div>
          </div>

          <div class='flex items-center justify-between pt-2 border-t border-slate-100 mt-2'>
            <span class='text-xs text-slate-500 font-semibold'>Submitted ${new Date(p.timestamp).toLocaleDateString()}</span>
            <div class='flex items-center gap-2'>
              ${!isApproved ? `
                <button onclick="window.app.updateStatus('${p.id}', 'Approved')" class='px-3 py-1.5 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1'>
                  <i data-lucide='check' class='w-3.5 h-3.5'></i>
                  <span>Approve</span>
                </button>
              ` : `
                <button onclick="window.app.updateStatus('${p.id}', 'Under Review')" class='px-3 py-1.5 text-xs font-extrabold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition'>
                  <span>Review</span>
                </button>
              `}
              <button onclick="window.app.viewProfileDetails('${p.id}')" class='px-3 py-1.5 text-xs font-extrabold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition flex items-center gap-1'>
                <span>Details</span>
                <i data-lucide='chevron-right' class='w-3.5 h-3.5'></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  viewProfileDetails(id) {
    const p = this.getProfiles().find(item => item.id === id);
    if (!p) return;
    this.activeProfileModal = id;
    const iconName = this.getVehicleIcon(p.vehicle.type);
    
    const drawer = document.getElementById('reviewer-drawer');
    let modal = document.getElementById('profile-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'profile-detail-modal';
      modal.className = 'absolute inset-0 bg-white z-30 flex flex-col overflow-y-auto p-5 animate-step text-slate-900';
      drawer.appendChild(modal);
    }

    modal.innerHTML = `
      <div class='flex items-center justify-between pb-4 border-b border-slate-200 mb-4'>
        <div>
          <span class='text-xs font-mono font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md'>${p.id}</span>
          <h3 class='text-lg font-black text-slate-900 mt-1'>${p.personal.fullName}</h3>
        </div>
        <button onclick="document.getElementById('profile-detail-modal').remove(); window.app.activeProfileModal = null;" class='w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition'>
          <i data-lucide='x' class='w-4 h-4'></i>
        </button>
      </div>

      <div class='space-y-4 text-xs text-slate-700'>
        <!-- Status Bar -->
        <div class='bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between'>
          <div>
            <span class='text-[10px] text-slate-500 uppercase block font-bold'>Application Status</span>
            <span class='font-black text-sm ${p.status === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}'>${p.status}</span>
          </div>
          <div class='flex gap-1.5'>
            <button onclick="window.app.updateStatus('${p.id}', 'Approved')" class='px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs'>
              <i data-lucide='check' class='w-3.5 h-3.5'></i>
              <span>Approve</span>
            </button>
            <button onclick="window.app.updateStatus('${p.id}', 'Under Review')" class='px-3 py-1.5 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 transition'>Review</button>
            <button onclick="window.app.updateStatus('${p.id}', 'Rejected')" class='px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition'>Reject</button>
          </div>
        </div>

        <!-- Personal Details -->
        <div class='bg-white p-4 rounded-2xl border border-slate-200 shadow-xs'>
          <div class='flex items-center gap-2 text-slate-900 text-xs font-black uppercase mb-3'>
            <i data-lucide='user' class='w-4 h-4 text-emerald-600'></i>
            <span>1. Personal & Contact Information</span>
          </div>
          <div class='grid grid-cols-2 gap-2.5 text-xs'>
            <div><span class='text-slate-500 font-bold'>Phone:</span> <p class='text-slate-900 font-extrabold mt-0.5'>${p.personal.phone}</p></div>
            <div><span class='text-slate-500 font-bold'>Email:</span> <p class='text-slate-900 font-extrabold mt-0.5'>${p.personal.email}</p></div>
            <div><span class='text-slate-500 font-bold'>City:</span> <p class='text-slate-900 font-bold mt-0.5'>${p.personal.city}</p></div>
            <div><span class='text-slate-500 font-bold'>DOB:</span> <p class='text-slate-900 font-bold mt-0.5'>${p.personal.dob || '1998-06-15'}</p></div>
            <div class='col-span-2'><span class='text-slate-500 font-bold'>Emergency Contact:</span> <p class='text-slate-900 font-bold mt-0.5'>${p.personal.emergencyName} (${p.personal.emergencyPhone})</p></div>
          </div>
        </div>

        <!-- Vehicle Information -->
        <div class='bg-white p-4 rounded-2xl border border-slate-200 shadow-xs'>
          <div class='flex items-center gap-2 text-slate-900 text-xs font-black uppercase mb-3'>
            <i data-lucide='${iconName}' class='w-4 h-4 text-emerald-600'></i>
            <span>2. Vehicle & Fleet Specs</span>
          </div>
          <div class='grid grid-cols-2 gap-2.5 text-xs'>
            <div><span class='text-slate-500 font-bold'>Vehicle Type:</span> <p class='text-slate-900 font-black mt-0.5'>${p.vehicle.type}</p></div>
            <div><span class='text-slate-500 font-bold'>Plate:</span> <p class='text-slate-900 font-mono font-black uppercase mt-0.5'>${p.vehicle.plate}</p></div>
            <div><span class='text-slate-500 font-bold'>Make & Model:</span> <p class='text-slate-900 font-bold mt-0.5'>${p.vehicle.make} ${p.vehicle.model}</p></div>
            <div><span class='text-slate-500 font-bold'>Year / Color:</span> <p class='text-slate-900 font-bold mt-0.5'>${p.vehicle.year || '2023'} · ${p.vehicle.color || 'Standard'}</p></div>
          </div>
        </div>

        <!-- Verified Documents & Compliance -->
        <div class='bg-white p-4 rounded-2xl border border-slate-200 shadow-xs'>
          <div class='flex items-center gap-2 text-slate-900 text-xs font-black uppercase mb-3'>
            <i data-lucide='shield-check' class='w-4 h-4 text-emerald-600'></i>
            <span>3. Documents & Compliance</span>
          </div>
          <div class='space-y-2.5 text-xs'>
            <div class='flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200'>
              <div class='flex items-center gap-3'>
                <i data-lucide='credit-card' class='w-4 h-4 text-emerald-600'></i>
                <div>
                  <p class='font-bold text-slate-900'>National ID (${p.identity.idNumber})</p>
                  <p class='text-[11px] text-slate-600 font-medium'>Biometric OCR verified · ${p.identity.compressionSize || '342 KB'}</p>
                </div>
              </div>
              <span class='text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full'>Verified</span>
            </div>
            <div class='flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200'>
              <div class='flex items-center gap-3'>
                <i data-lucide='file-badge' class='w-4 h-4 text-emerald-600'></i>
                <div>
                  <p class='font-bold text-slate-900'>Driver License (${p.documents.licenseNumber})</p>
                  <p class='text-[11px] text-slate-600 font-medium'>${p.documents.licenseClass} · Valid until ${p.documents.expiry || '2028'}</p>
                </div>
              </div>
              <span class='text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full'>Active</span>
            </div>
            <div class='flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200'>
              <div class='flex items-center gap-3'>
                <i data-lucide='shield' class='w-4 h-4 text-emerald-600'></i>
                <div>
                  <p class='font-bold text-slate-900'>Road Insurance Policy</p>
                  <p class='text-[11px] text-slate-600 font-medium'>Policy #${p.documents.insurancePolicy}</p>
                </div>
              </div>
              <span class='text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full'>Active</span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  render() {
    const container = document.getElementById('app-view-container');
    if (!container) return;
    this.updateReviewerBadge();

    switch (this.currentStep) {
      case 'splash':
        container.innerHTML = this.renderSplash();
        break;
      case 'auth':
        container.innerHTML = this.renderAuth();
        this.bindAuthEvents();
        break;
      case 'otp':
        container.innerHTML = this.renderOtp();
        this.bindOtpEvents();
        this.startOtpCountdown();
        break;
      case 'step1':
        container.innerHTML = this.renderStep1();
        this.bindStep1Events();
        break;
      case 'step2':
        container.innerHTML = this.renderStep2();
        this.bindStep2Events();
        break;
      case 'step3':
        container.innerHTML = this.renderStep3();
        this.bindStep3Events();
        break;
      case 'step4':
        container.innerHTML = this.renderStep4();
        this.bindStep4Events();
        break;
      case 'step5':
        container.innerHTML = this.renderStep5();
        this.bindStep5Events();
        break;
      case 'celebration':
        container.innerHTML = this.renderCelebration();
        this.bindCelebrationEvents();
        this.triggerConfetti();
        break;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // -------------------------------------------------------------------------
  // 0. SPLASH SCREEN (Driven UI Visuals — Zero Emojis)
  // -------------------------------------------------------------------------
  renderSplash() {
    return `
      <div class='animate-step flex flex-col justify-between h-full min-h-[600px]'>
        <div>
          <div class='flex items-center justify-between mb-5'>
            <div class='flex items-center gap-2'>
              <div class='w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-sm'>
                <i data-lucide='zap' class='w-4 h-4'></i>
              </div>
              <span class='font-extrabold tracking-tight text-xl text-slate-900'>TakeOFF</span>
              <span class='text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold tracking-wide uppercase'>Fleet</span>
            </div>
            <button onclick="window.app.goTo('auth')" class='text-xs font-bold text-emerald-600 hover:text-emerald-700'>Sign In</button>
          </div>

          <div class='relative bg-gradient-to-b from-emerald-50 to-teal-50/50 rounded-3xl p-6 border border-emerald-100/80 flex flex-col items-center justify-center mb-6 overflow-hidden text-center'>
            <div class='w-20 h-20 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4 shadow-inner ring-4 ring-emerald-500/10'>
              <i data-lucide='navigation' class='w-10 h-10 text-emerald-600'></i>
            </div>
            <span class='px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-[11px] font-extrabold tracking-wide uppercase mb-2'>
              TakeOFF Driver Partner
            </span>
            <h2 class='text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2'>
              Drive with Freedom.<br>Earn On Every Delivery.
            </h2>
            <p class='text-xs text-slate-600 max-w-xs leading-relaxed'>
              Join Zimbabwe's premier on-demand delivery network. Enjoy instant daily payouts and flexible schedules.
            </p>
          </div>

          <!-- Feature Highlights with Vector Icons -->
          <div class='space-y-2.5 mb-6'>
            <div class='flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm'>
              <div class='w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm'>
                <i data-lucide='wallet' class='w-4 h-4 text-emerald-600'></i>
              </div>
              <div class='text-left'>
                <h4 class='text-xs font-bold text-slate-900'>Instant EcoCash & InnBucks Payouts</h4>
                <p class='text-[11px] text-slate-500'>Cash out your earnings directly to your mobile wallet daily.</p>
              </div>
            </div>
            <div class='flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm'>
              <div class='w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm'>
                <i data-lucide='map-pin' class='w-4 h-4 text-emerald-600'></i>
              </div>
              <div class='text-left'>
                <h4 class='text-xs font-bold text-slate-900'>Harare & Bulawayo Coverage</h4>
                <p class='text-[11px] text-slate-500'>Dispatch routes optimized for minimal fuel and high order density.</p>
              </div>
            </div>
          </div>
        </div>

        <div class='space-y-2 pt-2'>
          <button onclick="window.app.goTo('auth')" class='btn-primary'>
            <span>Sign Up to Drive</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
          <button onclick="window.app.goTo('auth')" class='btn-ghost'>
            <span>I already have an account</span>
          </button>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 1. AUTH SCREEN (Phone + Channel Selector)
  // -------------------------------------------------------------------------
  renderAuth() {
    return `
      <div class='animate-step flex flex-col justify-between h-full min-h-[600px]'>
        <div>
          <button onclick="window.app.goTo('splash')" class='text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-5'>
            <i data-lucide='arrow-left' class='w-3.5 h-3.5'></i>
            <span>Back</span>
          </button>

          <div class='mb-6'>
            <span class='step-indicator-pill mb-2 inline-block'>Driver Authentication</span>
            <h2 class='text-2xl font-extrabold text-slate-900 mb-1'>Enter Mobile Number</h2>
            <p class='text-xs text-slate-500'>We will send a 6-digit verification code to authenticate your phone.</p>
          </div>

          <div class='space-y-4 mb-6'>
            <div>
              <label class='block text-xs font-bold text-slate-700 mb-1.5'>Mobile Phone Number *</label>
              <div class='flex items-center rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white transition overflow-hidden p-1'>
                <div class='flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 text-xs font-bold text-slate-700'>
                  <span class='px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold'>ZW</span>
                  <span>+263</span>
                </div>
                <input type='tel' id='auth-phone' value='0712599823' placeholder='71 259 9823' class='w-full px-3 py-2 text-sm font-bold text-slate-900 bg-transparent outline-none' />
              </div>
            </div>

            <div>
              <label class='block text-xs font-bold text-slate-700 mb-2'>Choose OTP Channel</label>
              <div class='grid grid-cols-2 gap-2.5'>
                <label class='flex items-center gap-2 p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 cursor-pointer text-xs font-bold text-slate-900'>
                  <input type='radio' name='otp-channel' value='whatsapp' checked class='accent-emerald-600' />
                  <i data-lucide='message-square' class='w-4 h-4 text-emerald-600'></i>
                  <span>WhatsApp</span>
                </label>
                <label class='flex items-center gap-2 p-3 rounded-xl border-2 border-slate-200 bg-white cursor-pointer text-xs font-bold text-slate-700 hover:border-slate-300'>
                  <input type='radio' name='otp-channel' value='sms' class='accent-emerald-600' />
                  <i data-lucide='smartphone' class='w-4 h-4 text-slate-500'></i>
                  <span>SMS Text</span>
                </label>
              </div>
            </div>
          </div>

          <div class='bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100/80 text-[11px] text-emerald-800 flex items-start gap-2'>
            <i data-lucide='info' class='w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5'></i>
            <span>Registered candidate phone <strong>+263 712 599 823</strong> prefilled for assessment test.</span>
          </div>
        </div>

        <div class='pt-6'>
          <button id='btn-send-otp' class='btn-primary'>
            <span>Send Verification Code</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
        </div>
      </div>
    `;
  }

  bindAuthEvents() {
    const btn = document.getElementById('btn-send-otp');
    if (btn) {
      btn.addEventListener('click', () => {
        const phoneInput = document.getElementById('auth-phone');
        this.draft.phone = '+263 ' + (phoneInput ? phoneInput.value.replace(/^0/, '').trim() : '712599823');
        this.goTo('otp');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 2. OTP VERIFICATION SCREEN
  // -------------------------------------------------------------------------
  renderOtp() {
    return `
      <div class='animate-step flex flex-col justify-between h-full min-h-[600px]'>
        <div>
          <button onclick="window.app.goTo('auth')" class='text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-5'>
            <i data-lucide='arrow-left' class='w-3.5 h-3.5'></i>
            <span>Change Phone</span>
          </button>

          <div class='mb-6'>
            <span class='step-indicator-pill mb-2 inline-block'>Security Verification</span>
            <h2 class='text-2xl font-extrabold text-slate-900 mb-1'>Enter 6-Digit OTP</h2>
            <p class='text-xs text-slate-500'>Code sent to <strong class='text-slate-800'>${this.draft.phone}</strong> via WhatsApp.</p>
          </div>

          <!-- 6-digit OTP Inputs -->
          <div class='flex justify-between gap-1.5 mb-6'>
            <input type='text' maxlength='1' class='otp-box' data-idx='0' value='8' autofocus />
            <input type='text' maxlength='1' class='otp-box' data-idx='1' value='4' />
            <input type='text' maxlength='1' class='otp-box' data-idx='2' value='2' />
            <input type='text' maxlength='1' class='otp-box' data-idx='3' value='9' />
            <input type='text' maxlength='1' class='otp-box' data-idx='4' value='5' />
            <input type='text' maxlength='1' class='otp-box' data-idx='5' value='9' />
          </div>

          <div class='text-center space-y-2'>
            <p class='text-xs text-slate-500'>
              Resend code in <span id='otp-timer-count' class='font-bold text-emerald-600 font-mono'>45s</span>
            </p>
            <button id='btn-resend-otp' class='text-xs font-bold text-emerald-600 hover:underline opacity-50 pointer-events-none'>
              Resend OTP via SMS
            </button>
          </div>
        </div>

        <div class='pt-6'>
          <button id='btn-verify-otp' class='btn-primary'>
            <span>Verify & Continue</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
        </div>
      </div>
    `;
  }

  bindOtpEvents() {
    const boxes = document.querySelectorAll('.otp-box');
    boxes.forEach((box, i) => {
      box.addEventListener('input', (e) => {
        if (e.target.value && i < boxes.length - 1) {
          boxes[i + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
          boxes[i - 1].focus();
        }
      });
    });

    const btn = document.getElementById('btn-verify-otp');
    if (btn) {
      btn.addEventListener('click', () => {
        this.goTo('step1');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. STEP 1 - PERSONAL & CONTACT PROFILE
  // -------------------------------------------------------------------------
  renderStep1() {
    return `
      <div class='animate-step flex flex-col justify-between h-full'>
        <div>
          <div class='stepper-header'>
            <span class='step-indicator-pill'>Step 1 of 4</span>
            <span class='text-xs font-bold text-slate-400'>Personal Profile</span>
          </div>
          <div class='progress-track'><div class='progress-bar' style='width: 25%'></div></div>

          <div class='mb-4'>
            <h2 class='text-xl font-extrabold text-slate-900 mb-1'>Driver Information</h2>
            <p class='text-xs text-slate-500'>Please enter your official legal name and contact details.</p>
          </div>

          <div class='space-y-3.5'>
            <div>
              <label class='block text-xs font-bold text-slate-700 mb-1'>Full Legal Name *</label>
              <input type='text' id='p-name' value='${this.draft.fullName}' class='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition' />
            </div>

            <div class='grid grid-cols-2 gap-2'>
              <div>
                <label class='block text-xs font-bold text-slate-700 mb-1'>Email Address *</label>
                <input type='email' id='p-email' value='${this.draft.email}' class='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition' />
              </div>
              <div>
                <label class='block text-xs font-bold text-slate-700 mb-1'>Date of Birth *</label>
                <input type='date' id='p-dob' value='${this.draft.dob}' class='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition' />
              </div>
            </div>

            <div>
              <label class='block text-xs font-bold text-slate-700 mb-1'>Primary Operating City *</label>
              <select id='p-city' class='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition'>
                <option value='Harare (CBD & Greater)' selected>Harare (CBD, Borrowdale, Avondale, Industrial)</option>
                <option value='Bulawayo (Suburbs & CBD)'>Bulawayo (CBD, Belmont, Suburbs)</option>
                <option value='Chitungwiza'>Chitungwiza & Surrounds</option>
                <option value='Mutare'>Mutare</option>
                <option value='Gweru'>Gweru</option>
              </select>
            </div>

            <div class='p-3 bg-slate-50 rounded-xl border border-slate-200/80'>
              <span class='text-[10px] font-bold text-slate-400 uppercase block mb-1.5'>Emergency Contact</span>
              <div class='grid grid-cols-2 gap-2'>
                <input type='text' id='p-em-name' value='${this.draft.emergencyName}' placeholder='Contact Name' class='w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white' />
                <input type='tel' id='p-em-phone' value='${this.draft.emergencyPhone}' placeholder='+263 77...' class='w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white' />
              </div>
            </div>
          </div>
        </div>

        <div class='pt-6 flex gap-2'>
          <button onclick="window.app.goTo('otp')" class='btn-ghost w-1/3'>Back</button>
          <button id='btn-next-step1' class='btn-primary w-2/3'>
            <span>Next: Identity</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
        </div>
      </div>
    `;
  }

  bindStep1Events() {
    const btn = document.getElementById('btn-next-step1');
    if (btn) {
      btn.addEventListener('click', () => {
        this.draft.fullName = document.getElementById('p-name').value.trim();
        this.draft.email = document.getElementById('p-email').value.trim();
        this.draft.dob = document.getElementById('p-dob').value;
        this.draft.city = document.getElementById('p-city').value;
        this.draft.emergencyName = document.getElementById('p-em-name').value.trim();
        this.draft.emergencyPhone = document.getElementById('p-em-phone').value.trim();
        this.goTo('step2');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 4. STEP 2 - IDENTITY & KYC
  // -------------------------------------------------------------------------
  renderStep2() {
    return `
      <div class='animate-step flex flex-col justify-between h-full'>
        <div>
          <div class='stepper-header'>
            <span class='step-indicator-pill'>Step 2 of 4</span>
            <span class='text-xs font-bold text-slate-400'>Identity & KYC</span>
          </div>
          <div class='progress-track'><div class='progress-bar' style='width: 50%'></div></div>

          <div class='mb-4'>
            <h2 class='text-xl font-extrabold text-slate-900 mb-1'>Government ID Verification</h2>
            <p class='text-xs text-slate-500'>Upload your national identity card or passport for KYC approval.</p>
          </div>

          <div class='space-y-3.5'>
            <div class='grid grid-cols-2 gap-2'>
              <div>
                <label class='block text-xs font-bold text-slate-700 mb-1'>Document Type *</label>
                <select id='id-type' class='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50'>
                  <option value='National ID Card' selected>National ID Card</option>
                  <option value='Passport'>Passport</option>
                </select>
              </div>
              <div>
                <label class='block text-xs font-bold text-slate-700 mb-1'>ID Number *</label>
                <input type='text' id='id-number' value='${this.draft.idNumber}' class='w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-slate-50 uppercase' />
              </div>
            </div>

            <!-- Front Document Upload -->
            <div>
              <label class='block text-xs font-bold text-slate-700 mb-1'>Front of ID Card *</label>
              <div class='upload-dropzone has-file'>
                <div class='flex items-center justify-between'>
                  <div class='flex items-center gap-2.5'>
                    <div class='w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs'>
                      <i data-lucide='credit-card' class='w-4 h-4'></i>
                    </div>
                    <div class='text-left'>
                      <p class='text-xs font-bold text-slate-800'>national_id_front.webp</p>
                      <p class='text-[11px] text-slate-800 font-semibold flex items-center gap-1 mt-0.5'>
                        <i data-lucide='check' class='w-3.5 h-3.5 text-emerald-600'></i>
                        <span class='text-slate-900 font-medium'>Auto-Compressed (342 KB) · OCR Verified</span>
                      </p>
                    </div>
                  </div>
                  <span class='text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-xs'>Uploaded</span>
                </div>
              </div>
            </div>

            <!-- Back Document Upload -->
            <div>
              <label class='block text-xs font-bold text-slate-700 mb-1'>Back of ID Card *</label>
              <div class='upload-dropzone has-file'>
                <div class='flex items-center justify-between'>
                  <div class='flex items-center gap-2.5'>
                    <div class='w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs'>
                      <i data-lucide='credit-card' class='w-4 h-4'></i>
                    </div>
                    <div class='text-left'>
                      <p class='text-xs font-bold text-slate-800'>national_id_back.webp</p>
                      <p class='text-[11px] text-slate-800 font-semibold flex items-center gap-1 mt-0.5'>
                        <i data-lucide='check' class='w-3.5 h-3.5 text-emerald-600'></i>
                        <span class='text-slate-900 font-medium'>Auto-Compressed (289 KB) · Barcode Matched</span>
                      </p>
                    </div>
                  </div>
                  <span class='text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-xs'>Uploaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='pt-6 flex gap-2'>
          <button onclick="window.app.goTo('step1')" class='btn-ghost w-1/3'>Back</button>
          <button id='btn-next-step2' class='btn-primary w-2/3'>
            <span>Next: Vehicle</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
        </div>
      </div>
    `;
  }

  bindStep2Events() {
    const btn = document.getElementById('btn-next-step2');
    if (btn) {
      btn.addEventListener('click', () => {
        this.draft.idType = document.getElementById('id-type').value;
        this.draft.idNumber = document.getElementById('id-number').value.trim();
        this.goTo('step3');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. STEP 3 - VEHICLE SELECTION (Driven Visual Aesthetic — Lucide Icons)
  // -------------------------------------------------------------------------
  renderStep3() {
    const vehicles = [
      { id: 'Motorbike', iconName: 'bike', name: 'Motorbike Courier', desc: 'Fast parcels & food (Up to 25kg)' },
      { id: 'Courier Car', iconName: 'car', name: 'Courier Car (Sedan)', desc: 'Cartons & passenger dispatch (Up to 150kg)' },
      { id: 'Delivery Van', iconName: 'truck', name: 'Delivery Van', desc: 'Commercial freight & appliances (Up to 1.2t)' },
      { id: 'Cargo Truck', iconName: 'container', name: 'Light Cargo Truck', desc: 'Pallet logistics & heavy cargo (3t - 5t)' }
    ];

    return `
      <div class='animate-step flex flex-col justify-between h-full'>
        <div>
          <div class='stepper-header'>
            <span class='step-indicator-pill'>Step 3 of 4</span>
            <span class='text-xs font-bold text-slate-400'>Vehicle Selection</span>
          </div>
          <div class='progress-track'><div class='progress-bar' style='width: 75%'></div></div>

          <div class='mb-4'>
            <h2 class='text-xl font-extrabold text-slate-900 mb-1'>Select Delivery Vehicle</h2>
            <p class='text-xs text-slate-500'>Choose the vehicle type you will use for TakeOFF deliveries.</p>
          </div>

          <div class='space-y-2 mb-4'>
            ${vehicles.map(v => `
              <div class='vehicle-card ${this.draft.vehicleType === v.id ? 'active' : ''}' data-vehicle='${v.id}'>
                <div class='flex items-center gap-3'>
                  <div class='w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100'>
                    <i data-lucide='${v.iconName}' class='w-5 h-5'></i>
                  </div>
                  <div>
                    <h4 class='text-xs font-bold text-slate-900'>${v.name}</h4>
                    <p class='text-[11px] text-slate-500'>${v.desc}</p>
                  </div>
                </div>
                <div class='check-circle'>
                  <i data-lucide='check' class='w-3 h-3'></i>
                </div>
              </div>
            `).join('')}
          </div>

          <div class='grid grid-cols-2 gap-2'>
            <div>
              <label class='block text-[11px] font-bold text-slate-700 mb-1'>Make & Model *</label>
              <input type='text' id='v-make' value='${this.draft.vehicleMake} ${this.draft.vehicleModel}' class='w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50' />
            </div>
            <div>
              <label class='block text-[11px] font-bold text-slate-700 mb-1'>Registration Plate *</label>
              <input type='text' id='v-plate' value='${this.draft.vehiclePlate}' class='w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-slate-50 uppercase' />
            </div>
          </div>
        </div>

        <div class='pt-6 flex gap-2'>
          <button onclick="window.app.goTo('step2')" class='btn-ghost w-1/3'>Back</button>
          <button id='btn-next-step3' class='btn-primary w-2/3'>
            <span>Next: Documents</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
        </div>
      </div>
    `;
  }

  bindStep3Events() {
    const cards = document.querySelectorAll('.vehicle-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.draft.vehicleType = card.getAttribute('data-vehicle');
      });
    });

    const btn = document.getElementById('btn-next-step3');
    if (btn) {
      btn.addEventListener('click', () => {
        this.draft.vehiclePlate = document.getElementById('v-plate').value.trim();
        this.goTo('step4');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 6. STEP 4 - DRIVER LICENSING & ROADWORTHINESS
  // -------------------------------------------------------------------------
  renderStep4() {
    return `
      <div class='animate-step flex flex-col justify-between h-full'>
        <div>
          <div class='stepper-header'>
            <span class='step-indicator-pill'>Step 4 of 4</span>
            <span class='text-xs font-bold text-slate-400'>Licensing & Safety</span>
          </div>
          <div class='progress-track'><div class='progress-bar' style='width: 100%'></div></div>

          <div class='mb-4'>
            <h2 class='text-xl font-extrabold text-slate-900 mb-1'>Driver & Fleet Documents</h2>
            <p class='text-xs text-slate-500'>Upload your driver's license and vehicle insurance certificate.</p>
          </div>

          <div class='space-y-3.5'>
            <div class='grid grid-cols-2 gap-2'>
              <div>
                <label class='block text-xs font-bold text-slate-700 mb-1'>License Number *</label>
                <input type='text' id='doc-licenseNum' value='${this.draft.licenseNumber}' class='w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-slate-50' />
              </div>
              <div>
                <label class='block text-xs font-bold text-slate-700 mb-1'>License Class *</label>
                <select id='doc-class' class='w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50'>
                  <option value='Class 3 (Motorcycle)' selected>Class 3 (Motorcycle)</option>
                  <option value='Class 4 (Light Motor Vehicle)'>Class 4 (Light Motor)</option>
                  <option value='Class 2 (Heavy Vehicle)'>Class 2 (Heavy Vehicle)</option>
                </select>
              </div>
            </div>

            <div>
              <label class='block text-xs font-bold text-slate-700 mb-1'>Driver's License Photo *</label>
              <div class='upload-dropzone has-file'>
                <div class='flex items-center justify-between'>
                  <div class='flex items-center gap-2.5'>
                    <div class='w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs'>
                      <i data-lucide='file-badge' class='w-4 h-4'></i>
                    </div>
                    <div class='text-left'>
                      <p class='text-xs font-bold text-slate-800'>driver_license_scan.webp</p>
                      <p class='text-[11px] text-slate-800 font-semibold flex items-center gap-1 mt-0.5'>
                        <i data-lucide='check' class='w-3.5 h-3.5 text-emerald-600'></i>
                        <span class='text-slate-900 font-medium'>Verified · Valid until 2028</span>
                      </p>
                    </div>
                  </div>
                  <span class='text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-xs'>Uploaded</span>
                </div>
              </div>
            </div>

            <div>
              <label class='block text-xs font-bold text-slate-700 mb-1'>Vehicle Insurance / Roadworthy *</label>
              <div class='upload-dropzone has-file'>
                <div class='flex items-center justify-between'>
                  <div class='flex items-center gap-2.5'>
                    <div class='w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs'>
                      <i data-lucide='shield-check' class='w-4 h-4'></i>
                    </div>
                    <div class='text-left'>
                      <p class='text-xs font-bold text-slate-800'>zimnat_third_party_cert.pdf</p>
                      <p class='text-[11px] text-slate-800 font-semibold flex items-center gap-1 mt-0.5'>
                        <i data-lucide='check' class='w-3.5 h-3.5 text-emerald-600'></i>
                        <span class='text-slate-900 font-medium'>Policy active · Policy #ZIMNAT-94821</span>
                      </p>
                    </div>
                  </div>
                  <span class='text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-xs'>Uploaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='pt-6 flex gap-2'>
          <button onclick="window.app.goTo('step3')" class='btn-ghost w-1/3'>Back</button>
          <button id='btn-next-step4' class='btn-primary w-2/3'>
            <span>Review Application</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
        </div>
      </div>
    `;
  }

  bindStep4Events() {
    const btn = document.getElementById('btn-next-step4');
    if (btn) {
      btn.addEventListener('click', () => {
        this.draft.licenseNumber = document.getElementById('doc-licenseNum').value.trim();
        this.draft.licenseClass = document.getElementById('doc-class').value;
        this.goTo('step5');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 7. STEP 5 - REVIEW & DIGITAL SIGN-OFF
  // -------------------------------------------------------------------------
  renderStep5() {
    return `
      <div class='animate-step flex flex-col justify-between h-full'>
        <div>
          <div class='flex items-center justify-between mb-3'>
            <span class='step-indicator-pill'>Final Review</span>
            <span class='text-xs font-bold text-emerald-600 flex items-center gap-1'>
              <i data-lucide='check-circle' class='w-3.5 h-3.5'></i>
              <span>Ready to Submit</span>
            </span>
          </div>

          <div class='mb-4'>
            <h2 class='text-xl font-extrabold text-slate-900 mb-1'>Review Your Application</h2>
            <p class='text-xs text-slate-500'>Please confirm your details and provide your digital signature.</p>
          </div>

          <div class='space-y-2.5 mb-4'>
            <!-- Personal Card -->
            <div class='p-3 rounded-2xl bg-slate-50 border border-slate-200'>
              <div class='flex items-center justify-between mb-1.5'>
                <span class='text-[10px] font-bold text-slate-400 uppercase'>1. Driver Profile</span>
                <button onclick="window.app.goTo('step1')" class='text-xs text-emerald-600 font-bold hover:underline'>Edit</button>
              </div>
              <div class='grid grid-cols-2 gap-1.5 text-xs'>
                <div><span class='text-slate-500'>Name:</span> <p class='font-bold text-slate-800'>${this.draft.fullName}</p></div>
                <div><span class='text-slate-500'>Phone:</span> <p class='font-bold text-slate-800'>${this.draft.phone}</p></div>
                <div><span class='text-slate-500'>City:</span> <p class='font-bold text-slate-800'>${this.draft.city.split(' ')[0]}</p></div>
                <div><span class='text-slate-500'>National ID:</span> <p class='font-bold text-slate-800 font-mono'>${this.draft.idNumber}</p></div>
              </div>
            </div>

            <!-- Vehicle Card -->
            <div class='p-3 rounded-2xl bg-slate-50 border border-slate-200'>
              <div class='flex items-center justify-between mb-1.5'>
                <span class='text-[10px] font-bold text-slate-400 uppercase'>2. Vehicle & Fleet Specs</span>
                <button onclick="window.app.goTo('step3')" class='text-xs text-emerald-600 font-bold hover:underline'>Edit</button>
              </div>
              <div class='grid grid-cols-2 gap-1.5 text-xs'>
                <div><span class='text-slate-500'>Type:</span> <p class='font-bold text-slate-800'>${this.draft.vehicleType}</p></div>
                <div><span class='text-slate-500'>Plate:</span> <p class='font-bold text-slate-800 font-mono uppercase'>${this.draft.vehiclePlate}</p></div>
                <div><span class='text-slate-500'>Model:</span> <p class='font-bold text-slate-800'>${this.draft.vehicleMake} ${this.draft.vehicleModel}</p></div>
                <div><span class='text-slate-500'>License:</span> <p class='font-bold text-slate-800 font-mono'>${this.draft.licenseNumber}</p></div>
              </div>
            </div>

            <!-- Digital Signature Canvas -->
            <div class='p-3 rounded-2xl bg-white border border-slate-200'>
              <div class='flex items-center justify-between mb-1.5'>
                <span class='text-[10px] font-bold text-slate-500 uppercase'>Digital Signature *</span>
                <button id='btn-clear-sig' class='text-[10px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1'>
                  <i data-lucide='rotate-ccw' class='w-3 h-3'></i>
                  <span>Clear</span>
                </button>
              </div>
              <canvas id='signature-pad' class='signature-canvas' width='380' height='100'></canvas>
              <p class='text-[10px] text-slate-400 mt-1 text-center'>Draw your signature above</p>
            </div>

            <!-- Terms Agreement -->
            <label class='flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1'>
              <input type='checkbox' id='chk-terms' checked class='mt-0.5 accent-emerald-600 rounded' />
              <span>I declare that all submitted vehicle and licensing documents are authentic and valid under Zimbabwean law.</span>
            </label>
          </div>
        </div>

        <div class='pt-4 flex gap-2'>
          <button onclick="window.app.goTo('step4')" class='btn-ghost w-1/3'>Back</button>
          <button id='btn-submit-application' class='btn-primary w-2/3'>
            <span>Submit Application</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
        </div>
      </div>
    `;
  }

  bindStep5Events() {
    // Signature Canvas Setup
    const canvas = document.getElementById('signature-pad');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0F172A';

      // Default sample signature stroke
      ctx.beginPath();
      ctx.moveTo(40, 60);
      ctx.bezierCurveTo(70, 20, 110, 80, 150, 45);
      ctx.bezierCurveTo(180, 20, 210, 70, 260, 50);
      ctx.stroke();

      let drawing = false;
      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
      };

      const start = (e) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
      const move = (e) => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
      const end = () => { drawing = false; };

      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start);
      canvas.addEventListener('touchmove', move);
      window.addEventListener('touchend', end);

      const clearBtn = document.getElementById('btn-clear-sig');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
      }
    }

    // Submit Button Logic
    const submitBtn = document.getElementById('btn-submit-application');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const newRefId = 'TKF-DRV-' + Math.floor(1000 + Math.random() * 9000);
        const profileRecord = {
          id: newRefId,
          timestamp: new Date().toISOString(),
          status: 'Under Review',
          personal: {
            fullName: this.draft.fullName,
            email: this.draft.email,
            phone: this.draft.phone,
            dob: this.draft.dob,
            city: this.draft.city,
            emergencyName: this.draft.emergencyName,
            emergencyPhone: this.draft.emergencyPhone
          },
          identity: {
            idType: this.draft.idType,
            idNumber: this.draft.idNumber,
            frontUploaded: true,
            backUploaded: true,
            compressionSize: '342 KB · WebP'
          },
          vehicle: {
            type: this.draft.vehicleType,
            iconName: this.getVehicleIcon(this.draft.vehicleType),
            make: this.draft.vehicleMake,
            model: this.draft.vehicleModel,
            year: this.draft.vehicleYear,
            plate: this.draft.vehiclePlate,
            color: this.draft.vehicleColor,
            capacity: 'Verified Cargo Spec'
          },
          documents: {
            licenseNumber: this.draft.licenseNumber,
            licenseClass: this.draft.licenseClass,
            expiry: this.draft.licenseExpiry,
            insurancePolicy: this.draft.insurancePolicy,
            roadworthyExpiry: this.draft.roadworthyExpiry,
            verified: true
          },
          signature: 'digital_verified_hash_' + Math.floor(Math.random() * 9000),
          notes: 'Submitted via TakeOFF Driver Web Flow.'
        };

        this.saveProfile(profileRecord);
        this.lastSubmittedId = newRefId;
        this.goTo('celebration');
      });
    }
  }

  // -------------------------------------------------------------------------
  // 8. CELEBRATION / CONFIRMATION SCREEN (Zero Emojis)
  // -------------------------------------------------------------------------
  renderCelebration() {
    const refId = this.lastSubmittedId || 'TKF-DRV-8429';
    return `
      <div class='animate-step flex flex-col justify-between h-full min-h-[600px] text-center'>
        <div>
          <div class='w-20 h-20 rounded-3xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/10 shadow-sm'>
            <i data-lucide='check-circle-2' class='w-10 h-10 text-emerald-600'></i>
          </div>

          <span class='px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold tracking-wide uppercase inline-block mb-2'>
            Application Submitted Successfully
          </span>

          <h2 class='text-2xl font-extrabold text-slate-900 mb-2'>Welcome to TakeOFF Fleet!</h2>
          <p class='text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed'>
            Your driver profile and vehicle documentation have been securely recorded in the fleet database.
          </p>

          <div class='p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 max-w-xs mx-auto'>
            <span class='text-[10px] text-slate-400 uppercase font-bold block mb-0.5'>Application Reference ID</span>
            <span class='text-lg font-mono font-black text-emerald-600 tracking-wider'>${refId}</span>
          </div>

          <!-- What happens next -->
          <div class='text-left bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 mb-4'>
            <h4 class='text-xs font-bold text-slate-900'>What happens next?</h4>
            <div class='flex items-start gap-3'>
              <div class='w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold'>1</div>
              <div>
                <h5 class='text-xs font-bold text-slate-800'>Document Verification</h5>
                <p class='text-[10px] text-slate-500'>Our compliance team verifies your ID & vehicle roadworthy.</p>
              </div>
            </div>
            <div class='flex items-start gap-3'>
              <div class='w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold'>2</div>
              <div>
                <h5 class='text-xs font-bold text-slate-800'>Background & Safety Check</h5>
                <p class='text-[10px] text-slate-500'>Automated license verification with Zimbabwean registry.</p>
              </div>
            </div>
            <div class='flex items-start gap-3'>
              <div class='w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold'>3</div>
              <div>
                <h5 class='text-xs font-bold text-slate-800'>Driver Activation</h5>
                <p class='text-[10px] text-slate-500'>Receive WhatsApp notification to start receiving delivery trips.</p>
              </div>
            </div>
          </div>
        </div>

        <div class='space-y-2 pt-2'>
          <button id='btn-open-reviewer-from-done' class='btn-primary'>
            <span>View in Reviewer Console</span>
            <i data-lucide='arrow-right' class='w-4 h-4'></i>
          </button>
          <button onclick="window.app.goTo('splash')" class='btn-ghost'>
            <span>Submit Another Test Application</span>
          </button>
        </div>
      </div>
    `;
  }

  bindCelebrationEvents() {
    const btn = document.getElementById('btn-open-reviewer-from-done');
    if (btn) {
      btn.addEventListener('click', () => {
        const drawer = document.getElementById('reviewer-drawer');
        const backdrop = document.getElementById('reviewer-backdrop');
        this.renderReviewerList();
        drawer.classList.add('open');
        backdrop.classList.add('open');
      });
    }
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new OnboardingState();
  const searchInput = document.getElementById('reviewer-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.app.renderReviewerList(e.target.value);
    });
  }
});
