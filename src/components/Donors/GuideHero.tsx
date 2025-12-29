import Image from "next/image";

export default function GuideHero() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white text-slate-800 ">
      {/* Header Section */}
      <div className="relative flex items-center mb-24 min-h-[72px] ">
        <div className="absolute left-1/2 -translate-x-1/2">
          <p className="text-slate-500 text-sm mb-1 font-medium">
            도서관 재창조
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[#c61b26] mb-2">
            로욜라 원 프로젝트
          </h1>
          <p className="text-slate-400 font-medium uppercase text-sm">
            loyola project - the next generation library
          </p>
        </div>

        {/* CTA Button (Right Aligned) */}
        <div className="ml-auto">
          <button className="bg-[#c61b26] text-white px-6 py-3 flex items-center gap-2">
            <Image
              src="/images/donateBtn.png"
              alt="donate"
              width={30}
              height={30}
            />
            <span className="font-bold text-sm">
              로욜라 원 프로젝트 기금 약정하기
            </span>
          </button>
        </div>
      </div>

      {/* Image Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10 h-auto lg:h-[450px]">
        <div className="relative w-full h-64 lg:h-full bg-slate-100 overflow-hidden group">
          <Image
            src="/images/info2Img1.jpg"
            alt="Loyola Library Exterior "
            fill
            className="object-cover "
          />
        </div>

        {/* Right: Two Interior Images */}
        <div className="grid grid-rows-2 gap-4 h-full">
          <div className="relative w-full h-64 lg:h-full bg-slate-100 overflow-hidden group">
            <Image
              src="/images/info2Img2.jpg"
              alt="Lounge Area "
              fill
              className="object-cover "
            />
          </div>
          <div className="relative w-full h-64 lg:h-full bg-slate-100 overflow-hidden group">
            <Image
              src="/images/info2Img3.jpg"
              alt="Library Shelves "
              fill
              className="object-cover "
            />
          </div>
        </div>
      </div>

      <div className="pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
          {/* Red Headline */}
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-semibold text-[#c61b26] mb-2">
              로욜라도서관은 서강대학교의 미래입니다.
            </h2>
            <p className="text-xl font-medium text-slate-700">
              꿈을 키우고 만들어가는 공간, 로욜라도서관
            </p>
          </div>

          <div className="flex-1 md:text-right">
            <h2 className="text-xl md:text-2xl font-medium text-[#0083ba]">
              "하나의(One) 마음으로, 최고의(No.1) 도서관으로"
            </h2>
          </div>
        </div>

        {/* Body Text */}
        <p className="text-slate-800 text-md max-w-4xl mb-6">
          디지털 시대의 교육환경 변화와 다양한 이용자의 요구에 맞춰 새로운
          정보문화공간이 필요하게 되었습니다. 이러한 시대적인 요청에 맞춰
          '로욜라 원 프로젝트(Loyola Project)'를 통해 한국 대학의 우수한
          도서관으로 거듭나고자 합니다.
        </p>
        <p className="text-slate-800 text-sm max-w-4xl">
          여러분의 후학들이 도서관에서 미래의 꿈을 키우고 상상력이 풍부한 융합적
          인재로 성장할 수 있도록 ‘로욜라 원 프로젝트’에 많은 관심과 성원
          부탁드립니다. 로욜라 원 프로젝트 기금에 참여해주시는 모든 후원자의
          이름을 도서관 곳곳에 새겨 드립니다.
        </p>
      </div>
    </div>
  );
}
