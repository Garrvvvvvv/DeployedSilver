import { Users, Code, Palette, Camera, FileText } from 'lucide-react';
import TeamMember from '../../components/TeamMember';
import DepartmentSection from '../../components/DepartmentSection';

function App() {
  const facultyHeads = [
    {
      name: 'Ms.Mansi Bhargava',
      position: 'Head Of Alumni Relations',
      photo:
        ' https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841017/mansi_akgkm7.jpg',
      linkedin: 'https://www.linkedin.com/in/thapar-alumni-relations-office/',
    },
    {
      name: 'Ms.Deepika',
      position: 'Senior Associate',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841222/deepika_z5i7st.jpg',
      linkedin: 'https://www.linkedin.com/in/thapar-alumni-relations-office/',
    },
  ];

  const studentLeads = [
    {
      name: 'Anmol Sethi',
      position: 'President',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762846085/anmolllllllll_ctrskb.jpg',
      linkedin: 'https://www.linkedin.com/in/anmol-sethi-79ba03228/',
      github: 'https://github.com/kushalpreetsallan',
    },
    {
      name: 'Kushagrh Rohilla',
      position: 'Executive Head',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841870/jatta_ka_chora_sicgc6.jpg',
      linkedin: 'https://www.linkedin.com/in/kushagrhrohilla/',
      github: 'https://github.com/Infurnux',
    },
    {
      name: 'Angad Bir Singh',
      position: 'Executive Head',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762846364/angad_ckdszm.jpg',
      linkedin: 'https://www.linkedin.com/in/angad-bir-singh-45507a281/',
      github: 'https://github.com/jatinsharma',
    },
    {
      name: 'Rakshit Dhamija',
      position: 'Outreach and Communication Head',
      photo:
        'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762807072/me_-_RAKSHIT_DHAMIJA_hk2ruf.jpg',
      linkedin: 'https://www.linkedin.com/in/rakshit-dhamija-870b39286/',
      github: 'https://github.com/Rakshit-Dhamija',
    },
  ];

  const departments = [
    {
      name: 'Tech Department',
      icon: Code,
      members: [
        {
          name: 'Garv Noor Sandha',
          position: 'Tech Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762839758/Profile_LINK_x49mdb.jpg',
          linkedin: 'https://linkedin.com/in/garvnoorsandha',
          github: 'https://github.com/garvnoorsandha',
        },
      ],
    },
    {
      name: 'Design Department',
      icon: Palette,
      members: [
        {
          name: 'Vani Sinha',
          position: 'Design Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762840620/vani_mjtrdb.jpg',
          linkedin: 'https://www.linkedin.com/in/vani-sinha-41988a335/',
          github: 'https://github.com/vanii04',
        },
        {
          name: 'Anjali Kumari',
          position: 'Design Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762842494/anjali_kqya84.jpg',
          linkedin: 'https://www.linkedin.com/in/anjali-kumari-aa7668323/',
          github: 'https://github.com/Anjalikumari990',
        },
        {
          name: 'Aarushi Pulugurty',
          position: 'Design Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762807502/WhatsApp_Image_2025-11-11_at_02.14.37_9fd3141e_a43ihk.jpg',
          linkedin: 'https://www.linkedin.com/in/aarushi-pulugurty-1b0675328/',
          github: 'https://github.com/aarushipulugurty',
        },
        {
          name: 'Dishita Bansal',
          position: 'Design Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762806636/WhatsApp_Image_2025-08-25_at_12.22.32_PM_2_-_Dishita_Bansal_wu2ewx.jpg',
          linkedin: 'https://www.linkedin.com/in/dishita-bansal/',
          github: 'https://github.com/Dishita-Bansal',
        },
      ],
    },
    {
      name: 'Media Department',
      icon: Camera,
      members: [
        {
          name: 'Agami',
          position: 'Media Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762806538/IMG_1956_-_Agami_1_tqrpmx.jpg',
          linkedin: 'https://www.linkedin.com/in/agami-garg-608692308/',
          github: 'https://github.com/agamigarg',
        },
        {
          name: 'Anmol Mittal',
          position: 'Media Lead',
          photo:'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762805858/Anmol_Mittal_it9ct9.jpg',
          linkedin: 'https://www.linkedin.com/in/anmol-mittal-75506337b',
          github: 'https://github.com/CoderAnmolMittal',
        },
        {
          name: 'Prisha Bharti ',
          position: 'Media Lead',
          photo:'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762843678/prisha_yhh7lh.jpg',
          linkedin: 'https://www.linkedin.com/in/prisha-bharti-8527b02b9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
        },
        {
          name: 'Ansh Bansal',
          position: 'Media Lead',
          photo:'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762842283/ansh_vna422.jpg',
          linkedin: 'https://www.linkedin.com/in/anshbansal1002/',
          github: 'https://github.com/CoderAnmolMittal',
        },
        {
          name: 'Siya Garg',
          position: 'Media Lead',
          photo:'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762845896/Siya_gnlt2o.jpg',
          linkedin: 'https://www.linkedin.com/in/siya-garg-b954a322b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        },
      ],
    },
    {
      name: 'Content Department',
      icon: FileText,
      members: [
        {
          name: 'Parnika Bharadvaja',
          position: 'Content Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762806927/PArnika_zmozxm.jpg',
          linkedin:
            'https://www.linkedin.com/in/parnika-bharadvaja-14029b343?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
          github: '',
        },
        {
          name: 'Harshil Jain',
          position: 'Content Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762840753/harshil123_rlybmj.png',
          linkedin: 'https://www.linkedin.com/in/harshil-jain-13a87731a',
          github: 'https://github.com/jainharshil34',
        },
        {
          name: 'Ayushi Kaushal',
          position: 'Content Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762841628/ayushi_jc8dul.jpg',
          linkedin: 'https://www.linkedin.com/in/ayushi-kaushal',
          github: 'https://github.com/AyushiK16',
        },
        {
          name: 'Tishya Pandey',
          position: 'Content Lead',
          photo:
            'https://res.cloudinary.com/dbl2so7ff/image/upload/v1762843363/tisha_gudtwu.jpg',
          linkedin: 'https://www.linkedin.com/in/ayushi-kaushal',
          github: 'https://github.com/AyushiK16',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black relative">
      {/* softened background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(139,92,246,0.08),transparent_60%)]" />

      <div className="relative">
        {/* Reduced header height & font sizes */}
        <header className="text-center py-8 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-white/90" />
            <span className="text-xs font-medium text-white/80">
              Alumni Relations Cell
            </span>
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white tracking-tight">
            Our Team
          </h1>
        </header>

        <section className="max-w-7xl mx-auto px-4 py-10">
          {/* Faculty Heads */}
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Faculty Heads
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mb-14">
            {facultyHeads.map((member, index) => (
              <div key={index} className="group">
                <TeamMember {...member} size="large" />
              </div>
            ))}
          </div>

          {/* Student Leadership */}
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Student Leadership
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center mb-14">
            {studentLeads.map((member, index) => (
              <div key={index} className="group">
                <TeamMember {...member} size="medium" />
              </div>
            ))}
          </div>

          {/* Departments */}
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Departments
            </h2>
          </div>
          <div className="space-y-12">
            {departments.map((dept, index) => (
              <DepartmentSection key={index} {...dept} />
            ))}
          </div>
        </section>

        <footer className="text-center py-10 px-4">
          <p className="text-gray-400 text-sm">
            Together we build connections that last a lifetime
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
