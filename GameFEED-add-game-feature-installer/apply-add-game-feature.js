#!/usr/bin/env node
/**
 * GameFEED / GameSphere Add Game Feature Installer
 *
 * Usage from your project root:
 *   node apply-add-game-feature.js
 *
 * It modifies only: frontend/src/App.jsx
 * A backup is created automatically before writing.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appPath = path.join(root, 'frontend', 'src', 'App.jsx');

function fail(message) {
  console.error('\n❌ ' + message + '\n');
  process.exit(1);
}

function info(message) {
  console.log('✅ ' + message);
}

if (!fs.existsSync(appPath)) {
  fail(`Could not find ${appPath}\nRun this command from the root folder of your GameFEED-project, where docker-compose.yml exists.`);
}

let code = fs.readFileSync(appPath, 'utf8');

if (code.includes('ADD_GAME_FEATURE_START')) {
  info('Add Game feature is already installed. No changes made.');
  process.exit(0);
}

const backupPath = appPath + '.backup-before-add-game';
fs.writeFileSync(backupPath, code, 'utf8');
info(`Backup created: ${backupPath}`);

const stateAnchor = "const [reviewError, setReviewError] = useState('');";
const stateSnippet = `

  // ADD_GAME_FEATURE_START - Add New Game modal state
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [gameError, setGameError] = useState('');
  const [gameForm, setGameForm] = useState({
    name: '',
    description: '',
    genre: 'Action',
    platform: '',
    releaseYear: new Date().getFullYear(),
    rating: 0,
    imageUrl: ''
  });
  // ADD_GAME_FEATURE_END
`;

if (!code.includes(stateAnchor)) {
  fail('Could not find reviewError state location in frontend/src/App.jsx. Your App.jsx may be different from the GitHub version.');
}
code = code.replace(stateAnchor, stateAnchor + stateSnippet);

const loadGamesRegex = /(const\s+loadGames\s*=\s*async\s*\(\)\s*=>\s*\{\s*try\s*\{\s*const\s+res\s*=\s*await\s+gameService\.getAllGames\(\);\s*setGames\(res\.data\);\s*\}\s*catch\s*\(err\)\s*\{\s*console\.error\("Error loading games",\s*err\);\s*\}\s*\};)/m;
const handlersSnippet = `

  // ADD_GAME_FEATURE_START - Add New Game handlers
  const resetGameForm = () => {
    setGameForm({
      name: '',
      description: '',
      genre: 'Action',
      platform: '',
      releaseYear: new Date().getFullYear(),
      rating: 0,
      imageUrl: ''
    });
    setGameError('');
  };

  const handleOpenAddGame = () => {
    if (!currentUser) {
      setAuthMode('login');
      setCurrentPage('auth');
      return;
    }

    resetGameForm();
    setIsAddGameModalOpen(true);
  };

  const handleAddGameSubmit = async (e) => {
    e.preventDefault();
    setGameError('');

    const payload = {
      name: gameForm.name.trim(),
      description: gameForm.description.trim(),
      genre: gameForm.genre.trim(),
      platform: gameForm.platform.trim(),
      releaseYear: Number(gameForm.releaseYear),
      rating: Number(gameForm.rating),
      imageUrl: gameForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
    };

    if (!payload.name || !payload.description || !payload.genre || !payload.platform) {
      setGameError('Please fill all required fields.');
      return;
    }

    if (Number.isNaN(payload.releaseYear) || payload.releaseYear < 1970 || payload.releaseYear > new Date().getFullYear() + 5) {
      setGameError('Please enter a valid release year.');
      return;
    }

    if (Number.isNaN(payload.rating) || payload.rating < 0 || payload.rating > 5) {
      setGameError('Rating must be between 0 and 5.');
      return;
    }

    try {
      const res = await gameService.addGame(payload);
      setIsAddGameModalOpen(false);
      resetGameForm();
      setSelectedGenre('All');
      setSearchKeyword('');
      await loadGames();

      if (res.data?.id) {
        await handleViewGame(res.data.id);
      } else {
        setCurrentPage('home');
      }
    } catch (err) {
      setGameError(err.response?.data?.error || 'Failed to add game. Please check if game-service and api-gateway are running.');
    }
  };
  // ADD_GAME_FEATURE_END
`;

const loadMatch = code.match(loadGamesRegex);
if (!loadMatch) {
  fail('Could not find loadGames function in frontend/src/App.jsx. Your App.jsx may be different from the GitHub version.');
}
code = code.replace(loadGamesRegex, `$1${handlersSnippet}`);

const browseIndex = code.indexOf('Browse Games');
if (browseIndex === -1) {
  fail('Could not find Browse Games button in frontend/src/App.jsx.');
}
const afterBrowseButton = code.indexOf('</button>', browseIndex);
if (afterBrowseButton === -1) {
  fail('Could not find end of Browse Games button in frontend/src/App.jsx.');
}

const addGameButtonSnippet = `

          {/* ADD_GAME_FEATURE_START - Header Add Game button */}
          <button
            onClick={handleOpenAddGame}
            className="flex items-center gap-1 bg-darkCard hover:bg-[#202433] border border-darkBorder hover:border-neonCyan text-gray-300 hover:text-neonCyan px-4 py-2 rounded-lg text-sm font-bold glow-transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Game</span>
          </button>
          {/* ADD_GAME_FEATURE_END */}
`;
code = code.slice(0, afterBrowseButton + '</button>'.length) + addGameButtonSnippet + code.slice(afterBrowseButton + '</button>'.length);

const modalSnippet = `

      {/* ADD_GAME_FEATURE_START - Add New Game Modal */}
      {isAddGameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel border border-darkBorder rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-darkBorder">
              <div>
                <h3 className="font-orbitron text-xl font-black text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-neonCyan" />
                  Add New Game
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Add a new game so other gamers can review it and share their experience.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAddGameModalOpen(false);
                  resetGameForm();
                }}
                className="p-1 text-gray-400 hover:text-white hover:bg-darkCard rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGameSubmit} className="p-6 space-y-4">
              {gameError && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{gameError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Game Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GTA VI"
                    value={gameForm.name}
                    onChange={(e) => setGameForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Genre</label>
                  <select
                    value={gameForm.genre}
                    onChange={(e) => setGameForm(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neonPurple"
                  >
                    <option value="Action">Action</option>
                    <option value="RPG">RPG</option>
                    <option value="Shooter">Shooter</option>
                    <option value="Sandbox">Sandbox</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Racing">Racing</option>
                    <option value="Sports">Sports</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Horror">Horror</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Platform</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PC, PlayStation, Xbox"
                    value={gameForm.platform}
                    onChange={(e) => setGameForm(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Release Year</label>
                  <input
                    type="number"
                    required
                    min="1970"
                    max={new Date().getFullYear() + 5}
                    value={gameForm.releaseYear}
                    onChange={(e) => setGameForm(prev => ({ ...prev, releaseYear: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Initial Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={gameForm.rating}
                    onChange={(e) => setGameForm(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Game Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/game-image.jpg"
                    value={gameForm.imageUrl}
                    onChange={(e) => setGameForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write a short description about the game..."
                  value={gameForm.description}
                  onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0b0c10]/80 border border-darkBorder focus:border-neonPurple rounded-lg p-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonPurple"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-darkBorder">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddGameModalOpen(false);
                    resetGameForm();
                  }}
                  className="bg-darkCard hover:bg-[#202433] border border-darkBorder text-gray-400 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-neonPurple to-neonPink text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-shadow hover:shadow-glow-purple"
                >
                  Add Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADD_GAME_FEATURE_END */}
`;

const mainCloseIndex = code.lastIndexOf('</main>');
if (mainCloseIndex === -1) {
  fail('Could not find closing </main> tag in frontend/src/App.jsx.');
}
code = code.slice(0, mainCloseIndex) + modalSnippet + code.slice(mainCloseIndex);

fs.writeFileSync(appPath, code, 'utf8');

info('Add Game feature installed successfully.');
console.log('\nNext commands:');
console.log('  docker compose up --build');
console.log('\nThen open: http://localhost:3000');
console.log('Login/Register, click Add Game, create a game, then review it.\n');
