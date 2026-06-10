/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Minimax.cpp                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: dkittaya <dkittaya@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/09 14:38:49 by dkittaya          #+#    #+#             */
/*   Updated: 2026/06/10 15:36:40 by dkittaya         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Minimax.hpp"

Breakthrough::t_move	Minimax::findBestMove(Breakthrough &game, int const &boardSize, int depth, Breakthrough::e_state player) {

	int									bestScore;
	Breakthrough::t_move				bestMove;
	std::vector<Breakthrough::t_move>	moves = generateMoves(game, boardSize, player);

	if (player == Breakthrough::WHITE)
		bestScore = INT_MIN;
	else
		bestScore = INT_MAX;
	
	for (std::vector<Breakthrough::t_move>::iterator it = moves.begin(); it != moves.end(); it++) {
		Breakthrough child(game);
		child.makeMove(*it);
		
		Breakthrough::e_state nextPlayer;
		if (player == Breakthrough::WHITE)
			nextPlayer = Breakthrough::BLACK;
		else
			nextPlayer = Breakthrough::WHITE;
		
		int	score = minimax(game, boardSize, depth, nextPlayer);
		if (player == Breakthrough::WHITE) {
			if (score > bestScore) {
				bestScore = score;
				bestMove = *it;
			}
		}
		else {
			if (score < bestScore) {
				bestScore = score;
				bestMove = *it;
			}
		}
	}
	return (bestMove);
}


int	Minimax::minimax(Breakthrough &game, int const &boardSize, int depth, Breakthrough::e_state player) {

	if (depth == 0 || game.isGameOver())
		return (evaluate(game, boardSize));
	
	if (player == Breakthrough::WHITE) {
		int maxEval = INT_MIN;
		std::vector<Breakthrough::t_move> moves = generateMoves(game, boardSize, player);
		if (moves.empty())
			return (evaluate(game, boardSize));
		for (std::vector<Breakthrough::t_move>::iterator it = moves.begin(); it != moves.end(); it++) {
			Breakthrough child(game);
			child.makeMove(*it);
			Breakthrough::e_state nextPlayer = Breakthrough::BLACK;
			int eval = minimax(child, boardSize, depth - 1, nextPlayer);
			maxEval = std::max(maxEval, eval);
		}
		return (maxEval);
	}
	else {
		int minEval = INT_MAX;
		std::vector<Breakthrough::t_move> moves = generateMoves(game, boardSize, player);
		if (moves.empty())
			return (evaluate(game, boardSize));
		for (std::vector<Breakthrough::t_move>::iterator it = moves.begin(); it != moves.end(); it++) {
			Breakthrough child(game);
			child.makeMove(*it);
			Breakthrough::e_state nextPlayer = Breakthrough::WHITE;
			int eval = minimax(child, boardSize, depth - 1, nextPlayer);
			minEval = std::min(minEval, eval);
		}
		return (minEval);
	}
}

std::vector<Breakthrough::t_move>
	Minimax::generateMoves(Breakthrough &game, int const &boardSize, Breakthrough::e_state player)
{
	std::vector<std::vector<int> > const	&board = game.getBoard();
	std::vector<Breakthrough::t_move>		moves;

	int	dir;
	/* Determinate direction through player color */
	if (player == Breakthrough::WHITE)
		dir = 1;
	else
		dir = -1;
	
	/* Looping through board to get valid moves for player */
	for (int row = 0; row < boardSize; row++) {
		for (int col = 0; col < boardSize; col++) {
			if (board[row][col] != player)
				continue;

			int	nextRow = row + dir;
			if (!game.isValidSquare(nextRow, col))
				continue;

			/* Check forward */
			if (board[nextRow][col] == Breakthrough::EMPTY)
				moves.push_back({row, col, nextRow, col});

			/* Check left diagonal */
			if (game.isValidSquare(nextRow, col - 1) &&
					board[nextRow][col - 1] != player)
			{
				moves.push_back({row, col, nextRow, col - 1});	
			}

			/* Check right diagonal */
			if (game.isValidSquare(nextRow, col + 1) &&
					board[nextRow][col + 1] != player)
			{
				moves.push_back({row, col, nextRow, col + 1});	
			}
		}
	}
	return (moves);
}

int	Minimax::evaluate(Breakthrough &game, int const &boardSize) {
	
	std::vector<std::vector<int >> const	&board = game.getBoard();

	int score = 0;
	for (int row = 0; row < boardSize; row++) {
		for (int col = 0; col < boardSize; col++) {
			if (board[row][col] == Breakthrough::WHITE) {
				score += 100;
				score += row * 10;
			}
			else if (board[row][col] == Breakthrough::BLACK) {
				score -= 100;
				score -= (boardSize - 1 - row) * 10;
			}
		}
	}
	return (score);
}
