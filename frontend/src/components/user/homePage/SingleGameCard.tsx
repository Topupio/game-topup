import { Game } from '@/services/games';

const SingleGameCard = ({ game }: { game: Game}) => {
    return (
        <div className="group relative mt-1 ">
            <div className="flex items-center gap-5 text-white">
                <img
                    src={game.imageUrl ?? undefined}
                    alt={game.name}
                    className="relative z-10 lg:w-24 w-20 lg:h-24 h-20 object-cover rounded-lg"
                />

                <div className="flex flex-col justify-between">
                    <p className="text-lg uppercase">{game.name}</p>
                    <p className="hidden lg:block">500 Uc</p>
                    <p>{game.category}</p>
                </div>
            </div>
        </div>
    )
}

export default SingleGameCard;