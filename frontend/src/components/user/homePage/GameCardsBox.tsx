import SingleGameCard from './SingleGameCard';

interface GameCardsBoxProps {
    title: string;
}

const GameCardsBox = ({ title }: GameCardsBoxProps) => {
    return (
        <div className='rounded-xl p-5 bg-white/5 backdrop-blur-xl border border-white/10'>
            <div className='flex justify-between my-2'>
                <h2 className='text-white font-semibold lg:text-xl mb-3'>
                    {title}
                </h2>
            </div>

            <div className='grid lg:grid-cols-2 grid-cols-1 gap-2'>
                <SingleGameCard />
                <SingleGameCard />
                <SingleGameCard />
                <SingleGameCard />
                <SingleGameCard />
                <SingleGameCard />
            </div>
        </div>
    )
}

export default GameCardsBox;