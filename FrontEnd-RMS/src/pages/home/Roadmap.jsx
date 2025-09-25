import React, { useEffect, useRef, useState } from 'react'

const Roadmap = () => {
    const containerRef = useRef(null)
    const [visibleIndexes, setVisibleIndexes] = useState(new Set())

    const steps = [
        { title: 'Synopsis Drafting', text: 'A brief overview (1–2 pages) of your research.' },
        { title: 'Literature Review', text: 'Identify key theories, gaps, and related works.' },
        { title: 'Research Methodology Outline', text: 'Proposed methods (qualitative/quantitative)' },
        { title: 'Drafting & Submitting Research Papers', text: 'Gain early feedback from the scholarly community, and begin establishing your expertise in the field.' },
        { title: 'Data Collection', text: 'Data collection & analysis techniques' },
        { title: 'Verification & Plagiarism Check', text: 'Quality control stage where you refine and double-check your core research question' },
        { title: 'Feedback and Final Approval', text: 'You present your detailed research plan (likely a thesis proposal) to your advisors or committee for formal review.' },
        { title: 'Archiving', text: 'Systematically organizing, storing, and preserving all your research data, notes, and materials.' }
    ]

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = Number(entry.target.getAttribute('data-index'))
                    if (entry.isIntersecting) {
                        setVisibleIndexes((prev) => new Set(prev).add(index))
                    }
                })
            },
            { root: null, threshold: 0.2 }
        )

        const nodes = containerRef.current?.querySelectorAll('[data-index]') || []
        nodes.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return (
        <div className='flex flex-col h-350 max-w-full container p-10 md:px-20 lg:px-32 overflow-hidden' id='Roadmap'>
            <div className='absolute ml-125'>
                <div className="relative bg-blue-500 w-40 h-1.5  left-105 top-20  rounded-sm"></div>
                <h3 className='font-poppins font-semibold text-4xl mt-25 ml-35 top-150'>Reasearch Road Map</h3>
                <div className="relative bg-blue-500 w-50 h-1.5  left-16 top-5  rounded-sm"></div>
            </div>

            {/* Move the roadmap below the <h3> */}
            <div className="mt-70" /> {/* Add margin to push roadmap below the heading */}
            <div ref={containerRef} className='relative h-[120px] md:h-[950px]'>
                {/* top row - three cards */}
                <RoadmapCard index={0} visible={visibleIndexes.has(0)} title={steps[0].title} text={steps[0].text} style={{ top: '40px', left: '5%' }} />
                <RoadmapCard index={1} visible={visibleIndexes.has(1)} title={steps[1].title} text={steps[1].text} style={{ top: '40px', left: '38%' }} />
                <RoadmapCard index={2} visible={visibleIndexes.has(2)} title={steps[2].title} text={steps[2].text} style={{ top: '40px', left: '71%' }} />

                {/* connectors between top row */}
                <div className='hidden md:block absolute top-[70px] left-[25%] w-[12%] h-px bg-gray-900'></div>
                <div className='hidden md:block absolute top-[70px] left-[58%] w-[12%] h-px bg-gray-900'></div>
                {/* outer brackets */}
                <div className='hidden md:block absolute top-[175px] left-[91%] w-[3%] h-[120px] border-r border-b rounded-br-2xl border-gray-900'></div>
                <div className='hidden md:block absolute top-[450px] left-[1%] w-[3%] h-[90px] border-l border-b rounded-bl-2xl border-gray-900'></div>

                {/* middle row - drafting (left) and data collection (right) */}
                <RoadmapCard index={3} visible={visibleIndexes.has(3)} title={steps[3].title} text={steps[3].text} style={{ top: '260px', left: '5%' }} />
                <RoadmapCard index={4} visible={visibleIndexes.has(4)} title={steps[4].title} text={steps[4].text} style={{ top: '260px', left: '71%' }} />
                {/* short connectors from center to middle row cards */}
                <div className='hidden md:block absolute top-[300px] left-[25%] w-[45%] h-px bg-gray-900'></div>
            

                {/* lower-middle row - verification (left) and feedback (right) */}
                <RoadmapCard index={5} visible={visibleIndexes.has(5)} title={steps[5].title} text={steps[5].text} style={{ top: '480px', left: '5%' }} />
                <RoadmapCard index={6} visible={visibleIndexes.has(6)} title={steps[6].title} text={steps[6].text} style={{ top: '480px', left: '71%' }} />
                <div className='hidden md:block absolute top-[520px] left-[25%] w-[45%] h-px bg-gray-900'></div>
            
                <div className='hidden md:block absolute top-[60px] left-[91%] w-[3%] h-[160px] border-r border-t rounded-tr-2xl border-gray-900'></div>
                <div className='hidden md:block absolute top-[310px] right-[96%] w-[3%] h-[160px] border-l border-t rounded-tl-2xl border-gray-900'></div>

                {/* bottom center - archiving */}
                <RoadmapCard index={7} visible={visibleIndexes.has(7)} title={steps[7].title} text={steps[7].text} style={{ top: '740px', left: '38%' }} />
                <div className='hidden md:block absolute top-[510px] left-[91%] w-[3%] h-[230px] border-r border-t rounded-tr-2xl border-gray-900'></div>
                <div className='hidden md:block absolute top-[645px] left-[61%] w-[33%] h-[120px] border-r border-b rounded-br-2xl border-gray-900'></div>
            </div>
        </div>
    )
}

export default Roadmap

const RoadmapCard = ({ index, visible, title, text, style }) => {
    return (
        <div
            data-index={index}
            style={style}
            className={`absolute max-w-[260px] transition-all duration-700 ease-out transform ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
        >
            <div className='inline-block rounded-xl bg-gradient-to-r drop-shadow-lg from-blue-300 to-purple-300 text-white  text-lg font-semibold p-15 py-3 shadow-sm w-64 md:w-80 text-center'>
                {title}
            </div>
            <p className='mt-5 text-gray-700 font-poppins text-sm leading-6'>
                {text}
            </p>
        </div>
    )
}
