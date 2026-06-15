/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Minimax.cpp                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: dkittaya <dkittaya@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/09 14:38:49 by dkittaya          #+#    #+#             */
/*   Updated: 2026/06/12 15:43:21 by dkittaya         ###   ########.fr       */
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
		
		int	score = minimax(child, boardSize, depth, nextPlayer, INT_MIN, INT_MAX);
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


int	Minimax::minimax(Breakthrough &game, int const &boardSize, int depth, Breakthrough::e_state player, int alpha, int beta) {

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
			int eval = minimax(child, boardSize, depth - 1, nextPlayer,  alpha, beta);
			maxEval = std::max(maxEval, eval);
			alpha = std::max(alpha, eval);
			if (beta <= alpha)
				break ;
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
			int eval = minimax(child, boardSize, depth - 1, nextPlayer, alpha, beta);
			minEval = std::min(minEval, eval);
			beta = std::min(beta, eval);
			if (beta <= alpha)
				break ;
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
			if (board[nextRow][col] == Breakthrough::EMPTY) {
				Breakthrough::t_move move = {row, col, nextRow, col};
				moves.push_back(move);
			}

			/* Check left diagonal */
			if (game.isValidSquare(nextRow, col - dir) &&
					board[nextRow][col - dir] != player)
			{
				Breakthrough::t_move move = {row, col, nextRow, col - dir};
				moves.push_back(move);	
			}

			/* Check right diagonal */
			if (game.isValidSquare(nextRow, col + dir) &&
					board[nextRow][col + dir] != player)
			{
				Breakthrough::t_move move = {row, col, nextRow, col + dir};
				moves.push_back(move);	
			}
		}
	}
	return (moves);
}

int	Minimax::evaluate(Breakthrough &game, int const &boardSize) {
	
	std::vector<std::vector<int> > const	&board = game.getBoard();

	int score = 0;
	for (int row = 0; row < boardSize; row++) {
		for (int col = 0; col < boardSize; col++) {
			if (board[row][col] == Breakthrough::WHITE) {
				/* Score from number of material */
				score += 1000;
				/* Score from distance traveled */
				score += row * 20;
				/* Score from center control */
				if (col >= (boardSize / 2) - 1 && col <= boardSize / 2)
					score += 10;
				/* Score from protected material */
				if ((row - 1 >= 0) && (col - 1 >= 0) && (col + 1 < boardSize)) {
					if(board[row - 1][col - 1] == Breakthrough::WHITE || board[row - 1][col + 1] == Breakthrough::WHITE)
						score += 20;
				}
			}
			else if (board[row][col] == Breakthrough::BLACK) {
				/* Score from number of material */
				score -= 1000;
				/* Score from distance traveled */
				score -= (boardSize - 1 - row) * 20;
				/* Score from center control */
				if (col >= (boardSize / 2) - 1 && col <= boardSize / 2)
					score -= 10;
				/* Score from protected material */
				if ((row + 1 < boardSize) && (col - 1 >= 0) && (col + 1 < boardSize)) {
					if (board[row + 1][col - 1] == Breakthrough::BLACK || board[row + 1][col + 1] == Breakthrough::BLACK)
						score -= 20;
				}
			}
		}
	}
	return (score);
}
