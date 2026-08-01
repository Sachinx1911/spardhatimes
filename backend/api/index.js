/**
 * Vercel वरचा प्रवेशबिंदू — **मुद्दाम JavaScript.**
 *
 * हा TypeScript असता तर Vercel चा bundler (esbuild) त्याला compile केला असता,
 * आणि तो `emitDecoratorMetadata` तयार करत नाही. NestJS ची पूर्ण dependency
 * injection त्याच metadata वर उभी आहे — म्हणजे build यशस्वी झाला असता आणि
 * app चालवताना "cannot resolve dependency" येऊन कोसळला असता.
 *
 * म्हणून सगळं Nest चं code `nest build` (म्हणजे tsc) नेच compile होतं, आणि
 * इथून फक्त त्या निकालाला हाक मारली जाते.
 */
const { getServer } = require('../dist/serverless');

module.exports = async (req, res) => {
  const server = await getServer();
  server(req, res);
};
