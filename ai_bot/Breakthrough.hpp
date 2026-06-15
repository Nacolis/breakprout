/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Breakthrough.hpp                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: dkittaya <dkittaya@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/09 14:45:36 by dkittaya          #+#    #+#             */
/*   Updated: 2026/06/12 15:18:51 by dkittaya         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef BREAKTHROUGH_HPP
# define BREAKTHROUGH_HPP

# include <iostream>
# include <vector>

# define BOARD_SIZE 7
# define PLAYING 1
# define ENDED 0

class	Breakthrough {
	public:
		enum	e_state {
			EMPTY,
			WHITE,
			BLACK
		};
		typedef struct	s_move {
			int	fromRow;
			int fromCol;
			int	toRow;
			int	toCol;
		}	t_move;

		Breakthrough();
		Breakthrough(int &boardSize);
		Breakthrough(Breakthrough const &other);
		Breakthrough &operator=(Breakthrough const &other);
		~Breakthrough();

		void initializeBoard();
		void printBoard() const;

		// std::vector<t_move> generateMoves(e_state player) const;

		bool	isValidSquare(int row, int col);
		bool	isGameOver();

		bool 	whiteWins();
		bool 	blackWins();

		void 	makeMove(t_move const &move);

		int		countPieces(e_state player);

		std::vector<std::vector<int> > const	&getBoard() const;
		int		getBoardSize() const;

	private:
		std::vector<std::vector<int> >	board_;
		int								boardSize_;
		bool							gameState_;
};

#endif
