/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Minimax.hpp                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: dkittaya <dkittaya@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/09 14:38:44 by dkittaya          #+#    #+#             */
/*   Updated: 2026/06/12 14:36:02 by dkittaya         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef MINIMAX_HPP
# define MINIMAX_HPP

# include "Breakthrough.hpp"
# include <iostream>
# include <string>
# include <vector>
# include <climits>

class	Minimax {

	public:
		Breakthrough::t_move static	findBestMove(Breakthrough &game, int const &boardSize, int depth, Breakthrough::e_state player);

	private:
		Minimax();
		~Minimax();
		Minimax(Minimax const &other);
		Minimax	&operator=(Minimax const &other);

		std::vector<Breakthrough::t_move> static	generateMoves(Breakthrough &game, int const &boardSize, Breakthrough::e_state player);
		int	static	minimax(Breakthrough &game, int const &boardSize, int depth, Breakthrough::e_state player, int alpha, int beta);
		int static	evaluate(Breakthrough &game, int const &boardSize);
};

#endif
