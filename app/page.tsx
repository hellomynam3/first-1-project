import Image from 'next/image';
import { ingredients } from './data/ingredients';

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-amber-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">DubaiZzon 🍫</h1>
          <p className="text-amber-100 text-lg">
            집에서 만드는 두바이 쫀득 쿠키! 최저가 재료를 한눈에 찾아보세요.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-bold mb-6 text-amber-900">
            🍪 필수 재료 모음
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {ingredients.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-amber-100"
              >
                <div className="relative h-48 w-full bg-gray-200">
                  {/* Next.js Image optimization would go here, using simple img for prototype */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    BEST
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {item.description}
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.unit}
                      </span>
                      <span className="text-lg font-bold text-amber-600">
                        {item.price.toLocaleString()}원~
                      </span>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      최저가 검색하기
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recipe Section (Placeholder) */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100">
          <h2 className="text-2xl font-bold mb-4 text-amber-900 text-center">
            👨‍🍳 간단 레시피 가이드
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto text-gray-700">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-bold mr-4">1</span>
              <p>카다이프 면을 잘게 자른 후 버터와 함께 팬에서 노릇하게 볶아주세요.</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-bold mr-4">2</span>
              <p>볶은 카다이프에 피스타치오 스프레드를 섞어 속재료(필링)를 만듭니다.</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-bold mr-4">3</span>
              <p>초콜릿 몰드에 녹인 초콜릿을 얇게 펴 바르고 굳힌 뒤, 필링을 채우고 다시 초콜릿으로 덮어주면 완성!</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 DubaiZzon. All rights reserved.</p>
          <p className="text-sm mt-2">이 사이트는 포트폴리오 목적으로 제작되었습니다.</p>
        </div>
      </footer>
    </div>
  );
}