/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.cpp                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: dkittaya <dkittaya@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/09 14:39:18 by dkittaya          #+#    #+#             */
/*   Updated: 2026/06/24 16:20:05 by dkittaya         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Breakthrough.hpp"
#include "Minimax.hpp"
#include <sys/socket.h>
#include <cstdlib>

int	main(int ac, char*av[]) {

	if (ac != 4) {
		std::cout << "Usage: ./proutfish < \"1x;0x;2x;\", player, depth >" << std::endl;
		return (1);
	}

	std::string				board = av[1];
	Breakthrough			game(board);
	Breakthrough::e_state	player = Breakthrough::WHITE;
	Breakthrough::t_move	bestMove;

	if (atoi(av[2]) == Breakthrough::BLACK)
		player = Breakthrough::BLACK;
	bestMove = Minimax::findBestMove(game, game.getBoardSize(), atoi(av[3]), player);
	game.makeMove(bestMove);
	// game.printBoard();
	Breakthrough::printMove(bestMove);

	return (0);
}
