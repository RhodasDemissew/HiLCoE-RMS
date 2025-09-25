import React, { useMemo, useState } from 'react'

const faqsData = [
  {
    q: 'How do I get started?',
    a:
      "When you sign up, you'll start with the Free plan. It's ideal for new teams and allows unlimited team members, but only 1 active editable project at a time. For more advanced features, check out our Basic, Premium, or Enterprise plans.",
  },
  {
    q: 'What features does it have?',
    a: 'Powerful authoring tools, real-time collaboration, AI-assisted checks, and workflow automations to keep projects moving.',
  },
  {
    q: 'How could I submit a file?',
    a: 'Drag-and-drop into your project or use the Upload button. We support common document formats and images.',
  },
]

const FAQs = () => {
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(0)

  const filtered = useMemo(() => {
    if (!query.trim()) return faqsData
    const q = query.toLowerCase()
    return faqsData.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
  }, [query])

  return (
    <main className='relative min-h-[95vh] py-45'>
      {/* soft gradient backdrop */}
      <div className='absolute w-210 h-170 left-115 bg-cover  bg-bottom' style={{backgroundImage: "url('../src/assets/svg/Group_91.svg')"}}/>

      <section className='relative container mx-auto px-6 md:px-16 lg:px-24'>
        <h1 className='text-2xl md:text-3xl font-poppins font-semibold text-center'>Frequently Asked Questions</h1>
        <div className='mx-auto mt-6 max-w-xl'>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search question'
            className='w-full rounded-full border border-gray-200 bg-white px-5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200'
          />
        </div>

        <div className='mx-auto mt-8 max-w-3xl z-10 space-y-4'>
          {filtered.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div key={idx} className={`rounded-xl border ${isOpen ? 'border-gray-200 bg-white/90' : 'border-transparent bg-white/70'} shadow-sm`}> 
                <button
                  className='flex w-full items-center justify-between px-5 py-3 text-left'
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                >
                  <span className='text-sm md:text-base font-medium'>{item.q}</span>
                  <span className='text-lg'>{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && (
                  <div className='px-5 pb-4 text-sm text-gray-700'>
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default FAQs