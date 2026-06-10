/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Breakthrough.cpp                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: dkittaya <dkittaya@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/09 14:45:59 by dkittaya          #+#    #+#             */
/*   Updated: 2026/06/10 15:42:36 by dkittaya         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Breakthrough.hpp"

Breakthrough::Breakthrough() : board_(BOARD_SIZE, std::vector<int>(BOARD_SIZE, EMPTY)), boardSize_(BOARD_SIZE), gameState_(PLAYING) {
	initializeBoard();
}

Breakthrough::Breakthrough(int &boardSize) : board_(boardSize, std::vector<int>(boardSize, EMPTY)), boardSize_(boardSize), gameState_(PLAYING) {
	initializeBoard();
}

Breakthrough::~Breakthrough() {
}

Breakthrough::Breakthrough(Breakthrough const &other) {
	if (this != &other) {
		*this = other;
	}
}
Breakthrough &Breakthrough::operator=(Breakthrough const &other) {
	if (this != &other) {
		this->board_ = other.board_;
		this->boardSize_ = other.boardSize_;
		this->gameState_ = other.gameState_;
	}
	return (*this);
}

void	Breakthrough::initializeBoard() {

	for (int row = 0; row < boardSize_; row++) {
		for (int col = 0; col < boardSize_; col++)
			board_[row][col] = EMPTY;
	}
	for (int col = 0; col < boardSize_; col++) {
		board_[0][col] = WHITE;
		board_[1][col] = WHITE;

		board_[boardSize_ - 2][col] = BLACK;
		board_[boardSize_ - 1][col] = BLACK;
	}
}

bool	Breakthrough::isValidSquare(int row, int col) {

	return (
		row >= 0
		&& row < boardSize_
		&& col >= 0
		&& col < boardSize_ );
}

void	Breakthrough::printBoard() const {

	for (int row = boardSize_ - 1; row >= 0; row--) {
		for (int col = 0; col < boardSize_; col++)
			std::cout << board_[row][col] << " ";
		std::cout << std::endl;
	}
}

void	Breakthrough::makeMove(t_move const &move) {

	int piece = board_[move.fromRow][move.fromCol];

	board_[move.fromRow][move.fromCol] = EMPTY;
	board_[move.toRow][move.toCol] = piece;
}

int		Breakthrough::countPieces(e_state player){

	int count = 0;
	for (int row = 0; row < boardSize_; row++) {
		for (int col = 0; col < boardSize_; col++) {
			if (board_[row][col] == player)
				count++;
		}
	}
	return (count);
}

bool	Breakthrough::whiteWins() {

	for (int col = 0; col < boardSize_; col++) {
		if (board_[boardSize_ - 1][col] == WHITE)
			return (true);
	}
	return (false);
}

bool	Breakthrough::blackWins() {

	for (int col = 0; col < boardSize_; col++) {
		if (board_[0][col] == BLACK)
			return (true);
	}
	return (false);
}

bool	Breakthrough::isGameOver() {

	if (whiteWins() || countPieces(BLACK) == 0) {
		this->gameState_ = ENDED;
		return (true);
	}
	if (blackWins() || countPieces(WHITE) == 0) {
		this->gameState_ = ENDED;
		return (true);
	}
	return (false);
}

std::vector<std::vector<int> > const	&Breakthrough::getBoard() const {
	return (this->board_);
}

int	Breakthrough::getBoardSize() const {
	return (this->boardSize_);
}