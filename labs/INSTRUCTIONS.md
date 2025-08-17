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
因为基于上述这么一个笼统需求， Spark 有可能不是每次生成的代码及效果都一致，以下记录本次 Spark 原型开发的迭代过程(耗时不超过30分钟)。

#### 1.3.1 初次生成并实时体验
- Prompt：
```
帮我用 phaser game 做一个 Space Shooter 的游戏。
```
整体的可玩性功能完成度高，基本上述 1.1 的目标就已经完成了。但之前的 prompt 并没提及这些点，就是丑。
![spark1](https://github.com/user-attachments/assets/3595fae9-10b2-4c2f-bd5b-76a5ad6f4f7d)

#### 1.3.2 界面美化
- Prompt：
```
现在的游戏界面有点丑， 下面的这些 assets 有可以好好利用 。
https://foozlecc.itch.io/void-main-ship
https://foozlecc.itch.io/void-environment-pack
https://foozlecc.itch.io/void-fleet-pack-1
https://ansimuz.itch.io/warped-space-shooter
https://piiixl.itch.io/space
```
我就是找了几个assets扔给了 Spark, 这个界面美化效果提升确实很棒。
![spark2](https://github.com/user-attachments/assets/3126ae2d-6db7-4258-8e0b-96ab161f82a6)


#### 1.3.3 引入关底 Boss
- Prompt：
```
你能不能设定一些关卡，加入对应的boss?
```
这一轮我没看到 Boss(后面看代码发现其实得在第三个 Sector 的关底出现），然后我又追加了段 prompt 在第三个 Sector Boss 出现了。
```
没看到boss 呢？ 能加个大点的乱军飞机，它能开炮有血条。
```
同时发现，在前面两个 Sector 的敌军会变大变少并且飘来飘去，难度上确实有上升。GIF 录制时长的问题我就没加到下面的动图中，可以点击 [spark-space-shooter-game](https://space-shooter-game--nikawang.github.app/) 试玩体验。
![spark3](https://github.com/user-attachments/assets/f4eceecf-2842-47fe-a588-a8dfd4139992)

#### 1.3.4 基于实现体验提出修改建议
Spark 除了上面在对话框中输入Prompt 来优化代码，也提供了代码修改的操作，但这个平台下去手改代码有点低效。它能让用户直接在 Live Editor 里基于某个区域来改修改。例如：

1. 输入 Prompt 来修改
<img width="1149" height="937" alt="image" src="https://github.com/user-attachments/assets/0d469506-d14e-458f-a917-ac65c28a3646" />
进入 `Select Element to edit` 后选择顶部的标题， 并输入 `Change to red for the fonts`

它会自动对这块区域字体进行修改，效果如下：
<img width="975" height="816" alt="image" src="https://github.com/user-attachments/assets/34568d5d-f170-4692-aca9-f66cebd1abd4" />

2. 在左侧编辑面板调整页面样式
<img width="1452" height="843" alt="image" src="https://github.com/user-attachments/assets/7fdb8fda-7d8a-4331-9851-ef4b7f167279" />



### 1.4 可能会遇到的问题
-  无法开启 Spark
  - 确认当前的帐户是否提供 Spark  功能
- 测试过程中可能会遇到 Bug 引起的 Crash, 直接点 Auto Fix 即可。
  <img width="1361" height="544" alt="image" src="https://github.com/user-attachments/assets/e0d01e6b-3719-4d11-bb35-995b67032dab" />


### 1.5 移交准备
在 Spark 中原型体验结束后，可以直接将发布。也可将其代码保存至 GitHub Repo 进行深度代码开发。在右上角选择即可

<img width="352" height="229" alt="image" src="https://github.com/user-attachments/assets/39bfc100-c750-42bc-8252-0261dfe609c6" />



## 阶段二：GitHub 仓库 + Coding Agent 协作迭代
### 2.1 目标
将原型演进为结构更清晰、可协作、可持续迭代的代码基线：
- 功能改进：修改关卡机制，让 Boss 更快的出现
- DevSecOps：依赖包漏洞扫描 + Continous Integration + Security Check + Continous Deployment 
- 协作流程：任务 -> 分支 -> PR -> Review -> Merge
- 引入 AI Coding Agent 执行重复或结构性修改（重构应用代码、引入 GitHub Action + Advanced Security + Azure Web App）

### 2.2 交给 Coding Agent 完成
以下为记录 引入 Coding Agent 协作过程（耗时不超过 1 个小时）
1. 接第一章节中 Spark 应用中创建的 GitHub Repo
2. 创建 Issue 去描述需要解决的问题
3. 将 Issue 分配给 Copilot 即可


#### 2.2.1 修改关卡机制，让 Boss 更快的出现
参考 [每关的第三波就得有 Boss](https://github.com/ghcpSharing/space-shooter-game/issues/6), 
- 创建 issue 完毕后分配给  Copilot
- Copilot 会基于这个 Issue 生成一个新的分支来开发并解决这个问题。
- 同时会有一个 Live Session 可以看到其工作日志, 在 PR 页面通过点击  Development 阶段的 In progress 去查看:
  <img width="1226" height="529" alt="image" src="https://github.com/user-attachments/assets/b556f5ed-a8af-4bb1-bf82-cdda1602c41e" />
  <img width="1608" height="800" alt="image" src="https://github.com/user-attachments/assets/4eba02f0-f1dd-4661-a8bc-c3735f723678" />
  
- 当修改完毕后会发起 [Pull Request](https://github.com/ghcpSharing/space-shooter-game/pull/7) 并邀请我来做 Code Review
  - 在这个 PR 描述的最后，有一个特别有意思的是它贴了一张测试结果的截图，它显示在第一关就就有 Boss 出现的血条，原来它也是有沙盒环境来构建并测试的。 点赞！


#### 2.2.2 添加 GitHub Workflow
参考 [添加 github action 做 cicd](https://github.com/ghcpSharing/space-shooter-game/issues/8), 
过程如 2.2.1 一样，只需要创建 Issue 并发给 Copilot 就好。它很好的完成了 CI + Security + CD。 
尤其在安全部分 GitHub Advanced Security 扫描出了对应的依赖库的版本漏洞及解决方案，并有对应的 PR 已经做好等我 Review, 例如[Bump tailwindcss from 4.0.17 to 4.1.12](https://github.com/ghcpSharing/space-shooter-game/pull/14)。同时静态代码扫描报出对应的代码风险及修改建议,例如[Prototype-polluting function](https://github.com/ghcpSharing/space-shooter-game/security/code-scanning/1)。

<img width="1626" height="817" alt="image" src="https://github.com/user-attachments/assets/aec4a60f-b6e4-4ec0-b46d-be2c96a5e026" />

它这个 Flow 的最后它给出了游戏在 Azure Web App 上的[游玩地址](http://space-shooter-game.azurewebsites.net/)

在 VSCode 中也通过 GitHub Pull Request extension 创建 Issue 并分配给 Copilot,也能 Track 它的 Session 日志
<img width="1421" height="634" alt="image" src="https://github.com/user-attachments/assets/5f6483d9-29e5-4ccd-af7b-9ef92b5acdaf" />


另， Coding Agent 支持自定义 Instructions 与 MCP Server 集成，后续会专门做一期 Lab 来介绍。

## 阶段三：本地 VS Code + GitHub Copilot 的 Vibe Computing
如果说前面的 Spark 和 Coding Agent 云端实现 Vibe Coding。 在本地环境中我们将进一步深化和 AI 协作，这个阶段将通过 VS Code 和 Copilot 实现更高效的开发体验。

### 3.1 目标
将本地环境调成预备状态，从 VS Code 的 GitHub Copilot 设定到 MCP/GitHub Extension 再到 Prompts 这三个维度来完成。
- 默认情况下 GitHub Copilot 的prompt并没有对项目开发做定向的优化，所以一开始用的时候会觉得 Copilot 并不是那么聪明，如果是默认的配置它其实有很多潜力并没有被释放出来。

### 3.2 环境准备
- Clone 阶段二的 GitHub 仓库到本地
- 安装 VS Code + GitHub Copilot & GitHub Copilot Chat

#### 3.2.1 VSCode 设置
```json
{
    "chat.agent.maxRequests": 125, #增加 Agent Mode 下单轮对话的最大请求次数
    "chat.checkpoints.showFileChanges": true, #Agent Mode 每轮修改后下显示文件变更内容
    "chat.math.enabled": true, #渲染数学公式显示
    "chat.todoListTool.enabled": true, #启用 todoList 工具, Copilot 会在制定 todoList 后，按照todoList 去工作
    "chat.tools.autoApprove": true, #远程环境下自动批准命令行运行
}
```

#### 3.2.2 MCP Server 配置
安装可以参考