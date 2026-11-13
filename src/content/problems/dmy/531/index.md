---
oj: dmy
pid: '531'
title: '[R83B] 巡逻'
difficulty: 普及-
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le h,w \le 50$，$1 \le q \le 2\times 10^5$，$1 \le r \le h$，$1 \le c \le w$，网格只含 `.` 与 `#`，指令串只含 `U`、`D`、`L`、`R`。

## 思路

**直接模拟。** 网格最大只有 $50\times 50=2500$ 个格子，指令只有 $2\times 10^5$ 条，逐步执行完全来得及。

维护小车当前坐标 $(x,y)$。对每条指令，先算出目标格 $(nx,ny)$：`U` 是 $(x-1,y)$，`D` 是 $(x+1,y)$，`L` 是 $(x,y-1)$，`R` 是 $(x,y+1)$。若目标格越界或为障碍，就不改动当前坐标，相当于原地不动；否则把当前坐标更新为目标格。

**统计不重复的格子。** 开一张与网格同尺寸的布尔表 `visited`，进入某个格子时若它还没被标记过，就把答案加一并标记。初始位置先标记一次，答案初始化为 $1$。

**细节。** 判断障碍只需要看格子字符是否为 `#`，可以在读入时就把网格预处理成「是否可通行」的布尔表，后续每步只看该表。坐标统一转成从 $0$ 开始的下标，越界判断即 $0 \le nx < h$、$0 \le ny < w$。

## 复杂度

每条指令只做常数次判断，预处理网格需要遍历全部 $hw$ 个格子，时间 $O(hw+q)$；`visited` 与网格各占 $O(hw)$ 空间。

## 仓颉实现

读入时把网格转成布尔表，指令串逐个字符处理，答案在首次进入新格子时自增。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let stdin = getStdIn()
    let first = stdin.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let h = first[0]
    let w = first[1]
    let rc = stdin.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let r = rc[0] - 1
    let c = rc[1] - 1
    let grid = Array<Array<Bool>>(h, { _ => Array<Bool>(w, { _ => true }) })
    for (i in 0..h) {
        let line = stdin.readln().getOrThrow().toRuneArray()
        let row = grid[i]
        for (j in 0..w) {
            row[j] = line[j] != r'#'
        }
    }
    let s = stdin.readln().getOrThrow()
    let visited = Array<Bool>(h * w, { _ => false })
    var x = r
    var y = c
    var ans: Int64 = 1
    visited[x * w + y] = true
    for (ch in s.runes()) {
        var nx = x
        var ny = y
        if (ch == r'U') {
            nx = x - 1
        } else if (ch == r'D') {
            nx = x + 1
        } else if (ch == r'L') {
            ny = y - 1
        } else if (ch == r'R') {
            ny = y + 1
        }
        if (nx >= 0 && nx < h && ny >= 0 && ny < w && grid[nx][ny]) {
            x = nx
            y = ny
            let idx = x * w + y
            if (!visited[idx]) {
                visited[idx] = true
                ans += 1
            }
        }
    }
    println(ans)
}
```

</details>
