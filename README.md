# 《代号：萌宠大逃亡》项目总览
欢迎来到项目协作仓库！这里集中管理游戏核心玩法、服务端、工具链以及用于跟踪与 GDD 一致性的资料。

## 核心参考
- **[游戏设计文档（GDD）](./GAME_DESIGN_DOCUMENT.md)**：所有系统、玩法与技术决策的权威来源。
- **[环境互动脚本与自测指引](./docs/ENVIRONMENT_INTERACTIONS.md)**：木板、追捕者、储物柜等脚本改动说明与 Node.js 自测方法。
- **[文档结构总览](./docs/DOCUMENTATION_OVERVIEW.md)**：列出仍在使用的文档，并说明如何从 Git 历史恢复旧资料。
- **[最新 GDD 差距分析](./docs/GDD_GAP_REVIEW.md)**：当前版本与 GDD 的差距及后续优先级建议。

## 如何测试环境互动
无需额外安装依赖，直接在仓库根目录执行：

```bash
node branch_env_interaction/tests/run_tests.js
```

如遇没有执行权限的提示，可先运行：

```bash
chmod +x branch_env_interaction/tests/run_tests.js
```

脚本会模拟木板眩晕、踩碎流程、中断恢复以及柜子潜入/拖出四种场景，通过后进程退出码为 0，便于集成自动化校验。

## 文档维护约定
新增资料优先扩展上述文档的相关章节；确有需要新建文件时，请放在 `docs/` 目录并更新《文档结构总览》，保持仓库目录清爽专业。

## 提交与合并提示
- 本地完成改动后，先在自己的分支执行 `git status`、`git commit`，确保所有调整都有明确记录。
- 没有默认分支（`main`）写入权限的协作者，请先运行 `git push origin <your-branch>` 并在 GitHub 上创建 Pull Request，由具备权限的维护者完成合并。
- 若需要新增推送或合并权限，请联系仓库管理员分配；当前文档机器人无法直接在远端执行 `git push` 或合并操作。

## 附加资料
- [Cocos Creator 快速启动指南（legacy）](./docs/legacy/COCOS_QUICKSTART_CN.md)：当需要在官方编辑器中重新构建客户端环境时，可按此流程完成安装与场景验证。
