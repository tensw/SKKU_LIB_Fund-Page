import React from "react";
import { Send, Phone, Mail, Home } from "lucide-react";
import Image from "next/image";

export default function GuideFooter() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white font-sans text-slate-700">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-3 h-0.5 bg-red-600"></div>
        <h3 className="text-lg font-bold text-slate-800">문의</h3>
      </div>

      <div className="space-y-10">
        <div className="space-y-2 text-[15px]">
          {/* Department */}
          <div className="flex items-start gap-3">
            <Image
              src="/images/send.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            {/* <Send className="w-4 h-4 mt-1 text-slate-400 -rotate-45" strokeWidth={2} /> */}
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                학술정보관:
              </span>
              <span className="text-slate-600">성균관대학교 발전협력팀</span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            {/* <Phone className="w-4 h-4 mt-1 text-slate-400" strokeWidth={2} /> */}
            <Image
              src="/images/phone.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                전화번호 :
              </span>
              <span className="text-slate-500">
                02-760-1207, <span className="mx-1 text-slate-300"></span>{" "}
                031-299-4021
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            {/* <Mail className="w-4 h-4 mt-1 text-slate-400" strokeWidth={2} /> */}
            <Image
              src="/images/mail.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                이메일 :
              </span>
              <a
                href="mailto:centrallib@skku.edu, samsunglib@skku.edu"
                className="text-[#236ca8]  hover:underline"
              >
                centrallib@skku.edu, samsunglib@skku.edu
              </a>
            </div>
          </div>

          {/* Homepage */}
          <div className="flex items-start gap-3">
            {/* <Home className="w-4 h-4 mt-1 text-slate-400" strokeWidth={2} /> */}
            <Image
              src="/images/home.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                홈페이지 :
              </span>
              <a
                href="https://library.sogang.ac.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#236ca8] hover:underline"
              >
                https://library.sogang.ac.kr
              </a>
            </div>
          </div>
        </div>

        {/* Contact Block 2: Office of External Affairs */}
        <div className="space-y-2 text-[15px]">
          {/* Department */}
          <div className="flex items-start gap-3">
            {/* <Send
              className="w-4 h-4 mt-1 text-slate-400 -rotate-45"
              strokeWidth={2}
            /> */}
            <Image
              src="/images/send.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                담당부서 :
              </span>
              <span className="text-slate-600">성균관대학교 발전협력팀</span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            {/* <Phone className="w-4 h-4 mt-1 text-slate-400" strokeWidth={2} /> */}
            <Image
              src="/images/phone.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                전화번호 :
              </span>
              <span className="text-slate-500">02-760-1153 </span>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            {/* <Mail className="w-4 h-4 mt-1 text-slate-400" strokeWidth={2} /> */}
            <Image
              src="/images/mail.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                이메일 :
              </span>
              <a
                href="mailto:fund@skku.edu"
                className="text-[#236ca8] hover:underline"
              >
                fund@skku.edu
              </a>
            </div>
          </div>

          {/* Homepage */}
          <div className="flex items-start gap-3">
            {/* <Home className="w-4 h-4 mt-1 text-slate-400" strokeWidth={2} /> */}
            <Image
              src="/images/home.png"
              height={15}
              width={15}
              alt="send"
              className="mt-1"
            />
            <div className="flex gap-2">
              <span className="font-bold text-slate-600 w-20 shrink-0">
                홈페이지 :
              </span>
              <a
                href="https://give.sogang.ac.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#236ca8] hover:underline"
              >
                https://give.sogang.ac.kr
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
