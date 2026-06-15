/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.cpp                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: dkittaya <dkittaya@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/09 14:39:18 by dkittaya          #+#    #+#             */
/*   Updated: 2026/06/15 13:38:37 by dkittaya         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Breakthrough.hpp"
#include "Minimax.hpp"

int	main(void) {

	int						boardSize = BOARD_SIZE;
	Breakthrough			game(boardSize);
	Breakthrough::t_move	bestMove;
	Breakthrough::e_state	player = Breakthrough::WHITE;

	while (!game.isGameOver()) {
		bestMove = Minimax::findBestMove(game, game.getBoardSize(), 5, player);
		game.makeMove(bestMove);
		game.printBoard();
		std::cout << std::endl;
		if (player == Breakthrough::WHITE)
			player = Breakthrough::BLACK;
		else
			player = Breakthrough::WHITE;
	}

	return (0);
}
