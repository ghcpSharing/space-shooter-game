<!--
Instruction Document for GitHub Copilot Lab: Space Shooter Game
-->

# Space Shooter Game 开发实验指引 (GitHub Copilot Lab)

## 概览
本实验通过一个 2D 太空射击 (Space Shooter) Web 游戏，串联 **三种 AI 辅助开发工作模式**：
1. GitHub Spark 云端原型快速探索
2. Fork 到 GitHub 仓库 + GitHub Coding Agent 协作式迭代
3. 本地克隆 + VS Code + GitHub Copilot 深度开发与优化

你将体验：需求澄清 → 原型验证  → 功能迭代 → 代码审查 → DevSecOps → 发布与复盘 的闭环过程。

## 角色与工具映射
- Product / Game Designer：提出玩法、节奏、关卡曲线
- Developer：实现核心循环、渲染、输入、音频、特效
- AI Pair (Spark / Coding Agent / Copilot on IDE)：生成、改进、重构、测试建议

## 阶段划分一览
| 阶段 | 名称 | 目标 | 主要产出 | 评估指标 |
|------|------|------|----------|----------|
| 1 | Spark 原型 | 验证核心玩法 (移动/射击/敌机/碰撞) | 美化运行界面且引入关底 Boss | 是否可玩、核心循环 |
| 2 | Repo + Agent | 推进 DevSecOps | 提出 Issue/PR 后 Coding Agent 协助完成 | CI/CD 、 代码审查 |
| 3 | 本地 + Copilot | 更高效且智能的开发体验 | 多元化的 Prompts/Tools/FeatureFlag 让 人+Copilot 更高效的完成任务 | 是否直观且智能的开发体验 |

## 快速跳转
- [阶段一：Spark 原型开发](#阶段一-github-spark-原型开发)
- [阶段二：Fork + Coding Agent 协作迭代](#阶段二-fork-到-github-仓库--coding-agent-协作迭代)
- [阶段三：本地 VS-Code + Copilot 深度开发](#阶段三-本地-vs-code--copilot-深度开发)


---

## 阶段一：GitHub Spark 原型开发
### 1.1 目标
在最短时间（≤ 1）内得到“可玩”的核心循环：
- 玩家飞船：移动
- 射击：基础子弹发射 & 冷却
- 敌机生成：简单波次或定时生成
- 碰撞判定：玩家子弹击毁敌机、敌机撞击玩家
- 基础得分与生命系统

### 1.2 准备
1. 打开 [GitHub Spark](https://github.com/spark)
2. 通过 Prompt 描述最小玩法（建议示例见下）

示例 Prompt（粘贴给 Spark）：
```
帮我用 phaser game 做一个 Space Shooter 的游戏。
```

### 1.3 迭代节奏
因为基于上述这么一个笼统需求， Spark 有可能不是每次生成的代码及效果都一致，以下记录本次 Spark 原型开发的迭代过程。

| 步骤 | Prompt | 阶段结果 |
|------|------|--------|
| 1 | 生成初版代码 | 运行是否无重大报错 |
| 2 | 加入调试 HUD（FPS/Score/Lives） | 数值是否更新 |
| 3 | 引入敌机波次参数 | 波次间隔是否生效 |
| 4 | 粗粒度性能检查 (Chrome Performance) | 主线程占用 < 10ms/frame |
| 5 | 记录原型 GAP | 列出后续架构与优化项 |

### 1.4 最佳实践
- 控制范围：一次只让 AI 生成一个增量（如“添加粒子爆炸效果”）
- 保持模块拆分：`GameLoop / Entities / Systems / Input` 避免单文件 > 300 行
- 及时清理：删除无用控制台输出、未使用变量、重复函数
- 基线注释：关键数据结构（敌机队列、碰撞网格）添加 1~2 行解释

### 1.5 产出清单（Exit Criteria）
- ✅ 可运行并可结束的游戏循环
- ✅ 基础评分 / 生命展示
- ✅ 简易 README 或开发笔记（记录核心循环 & 已知缺陷）
- ✅ 原型性能：普通硬件保持 ≥ 55 FPS
- ✅ 待办列表：架构重构点 / 待加入系统（音频、关卡、特效、UI）

### 1.6 移交准备
在 Spark 导出 / 复制代码前，整理：
- `KNOWN_ISSUES.md`：列出逻辑缺陷（例如：边缘碰撞不精确）
- `NEXT_REV_TASKS.md`：按优先级列出即将进入阶段二的任务（例如：音频系统、关卡配置 JSON、粒子池）

> 提示：不要在阶段一过早加入复杂状态管理或 ECS 框架，保持学习面最小化。


## 阶段二：Fork 到 GitHub 仓库 + Coding Agent 协作迭代
### 2.1 目标
将原型演进为结构更清晰、可协作、可持续迭代的代码基线：
- 模块化：关卡、音频、实体、系统、UI 分层
- 自动化：Lint / Type Check / 基础单测 / 构建工作流
- 协作流程：任务 -> 分支 -> PR -> Review -> Merge
- 引入 AI Coding Agent 执行重复或结构性修改（批量重构、生成测试、文档骨架）

### 2.2 仓库初始化步骤
1. 在 GitHub 上创建 / Fork 目标仓库 (private 或 public)
2. 将阶段一代码推送为 `main` 初始提交
3. 建立保护策略：
	- main 需要 PR 才能合并
	- 至少 1 名 Reviewer / 状态检查通过
4. 添加基础工作流：
	- `.github/workflows/ci.yml`：安装依赖 -> Lint -> Type Check -> 构建 -> 运行测试

### 2.3 分支与命名约定
| 类型 | 前缀 | 示例 | 说明 |
|------|------|------|------|
| 新功能 | feat/ | feat/audio-engine | 独立功能模块 |
| 修复 | fix/ | fix/collision-bounds | Bug 修复 |
| 重构 | refactor/ | refactor/entity-system | 内部结构调整 |
| 性能 | perf/ | perf/bullet-pool | 优化热点 |
| 文档 | docs/ | docs/api-gameobjects | 文档与说明 |

### 2.4 AI Coding Agent 典型用例
- 重构：将散落在多个文件的碰撞逻辑集中到 `CollisionSystem`
- 批量代码风格统一：统一 export 方式与命名
- 自动生成测试：为 `LevelManager` 生成单测骨架
- 生成配置：根据关卡节奏描述产出 JSON 配置 (敌机类型 + 时间轴)
- 评审辅助：分析 PR diff 给出潜在风险点（循环复杂度、重复逻辑）

示例任务描述（供 Agent 使用）：
```
Task: Introduce an AudioSystem for background music & sfx
Requirements:
- Load assets lazily
- Provide playOneShot(type) and loop(trackId)
- Avoid overlapping identical SFX within 50ms window
- Expose volume master/music/sfx channels
Add minimal unit tests for rate limiting logic.
```

### 2.5 Issue / PR 模板要点
Issue 模板字段：
- 背景 / 胶囊描述
- 验收标准 (Gherkin 可选)
- 风险与回滚方式
- 关联任务 / 依赖

PR 模板字段：
- 变更摘要（WHAT + WHY）
- 截图 / 性能前后对比（如有）
- 风险清单 & 手动验证步骤
- 相关 Issue 引用

### 2.6 模块化拆分建议
- `core/loop.ts`：主循环调度 & 时间步长
- `systems/`：`InputSystem`, `SpawnSystem`, `CollisionSystem`, `AudioSystem`, `ParticleSystem`
- `entities/`：`Player`, `Enemy`, `Bullet`, `PowerUp`
- `levels/`：配置 JSON + 解析器
- `ui/`：HUD、菜单、暂停界面
- `assets/manifest.json`：统一资源声明 + 版本校验

### 2.7 质量基线 (Quality Gates)
| 类型 | 工具 | 目标 | 触发失败策略 |
|------|------|------|--------------|
| 语法 & 风格 | ESLint | 0 error | 阻止合并 |
| 类型安全 | tsc --noEmit | 0 error | 阻止合并 |
| 单测 | Vitest/Jest | 覆盖核心系统 | 未达标标记警告 |
| 构建体积 | vite build | 初始 < 1MB gzip | 超标提示优化 |
| 性能冒烟 | headless 脚本 | 生成帧耗时分位 | 异常需复查 |

### 2.8 里程碑完成判定 (Exit Criteria)
- ✅ 核心系统按职责拆分完成
- ✅ CI 工作流稳定通过
- ✅ 至少 3 个代表性单测（关卡解析 / 碰撞 / 冷却逻辑）
- ✅ README 增补架构图（文本或 Mermaid）
- ✅ 已创建下一阶段性能与体验优化 Issue 列表

> 提示：阶段二不要过早引入重量级 ECS 框架；优先保证模块职责清晰与自动化可见性。


## 阶段三：本地 VS Code + Copilot 深度开发
### 3.1 目标
在本地环境进行深度迭代：性能优化、体验打磨、测试覆盖、可配置化与可发布性。

### 3.2 环境准备
1. Clone 仓库：`git clone <repo>`
2. 安装依赖：`pnpm i` / `npm install`
3. 运行开发服务器：`pnpm dev` -> 浏览器验证
4. 安装 VS Code 插件：Copilot / Copilot Chat / ESLint / TypeScript TSS Helper / GitLens / Tailwind IntelliSense
5. 可选：配置 `.vscode/settings.json` 强制保存自动修复 & 类型检查

### 3.3 Copilot 使用模式
| 场景 | 技巧 | 示例 Prompt |
|------|------|-------------|
| 小函数补全 | 行内建议 | 输入函数签名等待建议 |
| 批量重构 | Chat + 选择文件上下文 | “Refactor collision logic into quadtree util, keep API stable” |
| 生成测试 | Chat 指令 | “Generate vitest tests for LevelManager covering invalid JSON and timed spawn” |
| 代码解释 | `//@copilot explain` | 选中复杂循环让 Copilot 解释 |
| 性能分析 | 结合 Profile 输出 | “Suggest micro-optimizations for this hot loop (paste loop)” |

### 3.4 性能优化关注点
| 维度 | 策略 | 工具 |
|------|------|------|
| 渲染 | 批绘制 / 合并状态切换 / 降低 overdraw | Canvas 层分析 / Chrome DevTools Paint |
| 分配 | 对象池 (子弹/粒子) / 复用数组 | Performance Memory 快照 |
| 碰撞 | 分区 / 四叉树 / 网格桶 | 自定义基准 & flame chart |
| 频率 | 降低非关键逻辑频率 (UI 刷新 / 掉落计算) | requestAnimationFrame 分析 |
| 打包 | Tree-shaking / 代码分割 / 压缩 | Vite 构建分析 (analyze plugin) |

### 3.5 测试策略
- 层级划分：
	- 单元：纯函数（关卡解析、冷却计算、碰撞检测）
	- 集成：系统交互（Spawn + Collision + Score）
	- 端到端（可选）：Playwright 自动游玩 10 秒检测无错误输出
- 覆盖重点：行为确定性（随机数可注入种子）+ 边界（极限敌机数量）

### 3.6 资产与音频扩展
- 引入 `AudioSystem`：懒加载、并发限制、通道音量
- 背景音乐分关卡切换（淡入淡出）
- SFX：射击、爆炸、拾取、受伤（统一在资产清单中声明）

### 3.7 可配置化
- `config/game.json`：全局参数（玩家速度、子弹冷却、最大敌机数）
- `levels/*.json`：每关节奏时间轴（t=秒 -> 事件列表）
- 加入 `ConfigService` 负责热加载（开发模式）

### 3.8 发布与打包
1. 运行 `pnpm build`
2. 检查构建产物大小 & Source Map
3. 部署（任选）：GitHub Pages / Vercel / Azure Static Web Apps
4. 验证：
	 - 首屏加载 (LCP) < 2.5s（模拟中端设备）
	 - 控制台无严重错误 / 未捕获 Promise 拒绝

### 3.9 Exit Criteria
- ✅ 关键系统性能收敛（主循环 16ms 内）
- ✅ 单测覆盖核心逻辑 & 关键失败路径
- ✅ 音频 & 粒子特效体验完整
- ✅ 配置化支持快速调参 (无需改源码)
- ✅ 发布链接 & 标签版本 (e.g. v1.0.0)

> 提示：性能优化遵循“测量—定位—假设—验证”四步，避免无数据的过早优化。
